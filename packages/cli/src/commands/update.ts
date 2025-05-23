import { buildProject, handleError, runBunCommand } from '@/src/utils';
import { displayBanner as showBanner } from '@/src/utils';
import { Command } from 'commander';
import { execa } from 'execa';
import { existsSync, readFileSync } from 'node:fs';
import fs from 'node:fs/promises';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import prompts from 'prompts';
import semver from 'semver';

// Function to get the package version
function getVersion(): string {
  // For ESM modules we need to use import.meta.url instead of __dirname
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Find package.json relative to the current file
  const packageJsonPath = path.resolve(__dirname, '../package.json');

  // Add a simple check in case the path is incorrect
  let version = '0.0.0'; // Fallback version
  if (!existsSync(packageJsonPath)) {
    console.warn(`Warning: package.json not found at ${packageJsonPath}`);
  } else {
    try {
      const packageJsonContent = readFileSync(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageJsonContent);
      version = packageJson.version || '0.0.0';
    } catch (error) {
      console.error(`Error reading or parsing package.json at ${packageJsonPath}:`, error);
    }
  }
  return version;
}

/**
 * Check if a package is using a workspace reference
 * @param versionString The version string to check
 * @returns Whether the version string indicates a workspace reference
 */
function isWorkspaceVersion(versionString: string): boolean {
  return (
    versionString === 'workspace:*' ||
    versionString === 'workspace' ||
    versionString.startsWith('workspace:')
  );
}

/**
 * Updates dependencies in a project or plugin to the latest ElizaOS versions
 * @param cwd Working directory of the project/plugin
 * @param isPlugin Whether this is a plugin or project
 */
async function updateDependencies(cwd: string, isPlugin: boolean): Promise<void> {
  console.info(`Updating ${isPlugin ? 'plugin' : 'project'} dependencies...`);

  // Get the current CLI version (for informational purposes)
  const currentCliVersion = getVersion();
  console.info(`Current CLI version: ${currentCliVersion}`);

  try {
    // Find the latest published version by timestamp
    const { stdout } = await execa('npm', ['view', '@elizaos/cli', 'time', '--json']);
    const timeData = JSON.parse(stdout);

    // Remove metadata entries like 'created' and 'modified'
    delete timeData.created;
    delete timeData.modified;

    // Find the most recently published version
    let latestCliVersion = '';
    let latestDate = new Date(0); // Start with epoch time

    for (const [version, dateString] of Object.entries(timeData)) {
      const publishDate = new Date(dateString as string);
      if (publishDate > latestDate) {
        latestDate = publishDate;
        latestCliVersion = version;
      }
    }

    // If we can't find the latest version, use the current version
    if (!latestCliVersion) {
      latestCliVersion = currentCliVersion;
      console.info(
        `Could not determine latest version, using current CLI version: ${latestCliVersion}`
      );
    } else {
      console.info(`Latest available CLI version: ${latestCliVersion}`);
    }

    // Get list of installed dependencies
    const packageJsonPath = path.join(cwd, 'package.json');
    if (!existsSync(packageJsonPath)) {
      console.error('package.json not found in the current directory');
      return;
    }

    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    // Find all ElizaOS packages
    const elizaPackages = [...Object.entries(dependencies), ...Object.entries(devDependencies)]
      .filter(([pkg]) => pkg.startsWith('@elizaos/'))
      .map(([pkg, version]) => ({ name: pkg, version }));

    if (elizaPackages.length === 0) {
      console.info('No ElizaOS packages found to update');
      return;
    }

    // Check for workspace references
    const workspacePackages = elizaPackages.filter((pkg) =>
      isWorkspaceVersion(pkg.version as string)
    );
    if (workspacePackages.length > 0) {
      console.info(
        `Found ${workspacePackages.length} workspace references: ${workspacePackages.map((p) => p.name).join(', ')}`
      );
      console.info(
        'Skipping update for workspace packages as they should be managed by the monorepo'
      );

      // Remove workspace packages from the update list
      const packagesToUpdate = elizaPackages.filter(
        (pkg) => !isWorkspaceVersion(pkg.version as string)
      );
      if (packagesToUpdate.length === 0) {
        console.info('No non-workspace ElizaOS packages to update');
        return;
      }

      console.info(
        `Will update ${packagesToUpdate.length} non-workspace packages: ${packagesToUpdate.map((p) => p.name).join(', ')}`
      );

      // Update the list to only include non-workspace packages
      elizaPackages.length = 0;
      elizaPackages.push(...packagesToUpdate);
    } else {
      console.info(
        `Found ${elizaPackages.length} ElizaOS packages: ${elizaPackages.map((p) => p.name).join(', ')}`
      );
    }

    // Determine update type - minor by default, major requires confirmation
    const hasMajorUpdates = elizaPackages.some((pkg) => {
      const pkgVersion = String(pkg.version).replace(/^\^|~/, '');
      return (
        pkgVersion && latestCliVersion && semver.major(latestCliVersion) > semver.major(pkgVersion)
      );
    });

    if (hasMajorUpdates) {
      const { confirmMajor } = await prompts({
        type: 'confirm',
        name: 'confirmMajor',
        message: 'Major version updates detected. This may include breaking changes. Continue?',
        initial: false,
      });

      if (!confirmMajor) {
        console.info('Update canceled');
        return;
      }
    }

    // Update each package to the latest CLI version
    for (const pkg of elizaPackages) {
      try {
        console.info(`Updating ${pkg.name} to version ${latestCliVersion}...`);
        await runBunCommand(['add', `${pkg.name}@${latestCliVersion}`], cwd);
      } catch (error) {
        console.error(`Failed to update ${pkg.name}: ${error.message}`);
        console.info('Trying to use exact version match...');
        try {
          // If the specific version isn't available, try to find the closest version
          await runBunCommand(['add', pkg.name], cwd);
        } catch (secondError) {
          console.error(`Failed to install ${pkg.name} after retrying: ${secondError.message}`);
        }
      }
    }

    console.log('Dependencies updated successfully');

    // Run install to ensure all dependencies are properly installed
    console.info('Installing updated dependencies...');
    await runBunCommand(['install'], cwd);

    // Build the project/plugin with updated dependencies
    await buildProject(cwd, isPlugin);
  } catch (error) {
    console.error(`Error updating dependencies: ${error.message}`);
  }
}

/**
 * Check if the current directory is likely a plugin directory
 */
function checkIfPluginDir(dir: string): boolean {
  const packageJsonPath = path.join(dir, 'package.json');
  if (!existsSync(packageJsonPath)) {
    return false;
  }

  try {
    const packageJsonContent = readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    if (packageJson.name?.startsWith('@elizaos/plugin-')) {
      return true;
    }

    const keywords = packageJson.keywords || [];
    return keywords.includes('elizaos-plugin');
  } catch {
    return false;
  }
}

// Create command for updating dependencies
export const update = new Command()
  .name('update')
  .description('Update ElizaOS packages to the latest versions')
  .option('-c, --check', 'Check for available updates without applying them')
  .hook('preAction', async () => {
    try {
      await showBanner();
    } catch (error) {
      // Silently continue if banner display fails
      console.debug('Banner display failed, continuing with update');
    }
  })
  .option('-sb, --skip-build', 'Skip building after updating')
  .action(async (options) => {
    try {
      const cwd = process.cwd();

      // Determine if we're in a project or plugin directory
      const isPlugin = checkIfPluginDir(cwd);
      console.info(`Detected ${isPlugin ? 'plugin' : 'project'} directory`);

      if (options.check) {
        // Only check for updates without applying them
        console.info('Checking for available updates...');
        const cliVersion = getVersion();
        console.info(`Current CLI version: ${cliVersion}`);
        console.info('To apply updates, run this command without the --check flag');
        return;
      }

      // Update dependencies
      await updateDependencies(cwd, isPlugin);

      console.log(
        `${isPlugin ? 'Plugin' : 'Project'} successfully updated to the latest ElizaOS packages`
      );
    } catch (error) {
      handleError(error);
    }
  });

export function displayBanner() {
  // Color ANSI escape codes
  const b = '\x1b[38;5;27m';
  const lightblue = '\x1b[38;5;51m';
  const w = '\x1b[38;5;255m';
  const r = '\x1b[0m';
  const red = '\x1b[38;5;196m';
  let versionColor = lightblue;

  const version = getVersion();

  // if version includes "beta" or "alpha" then use red
  if (version?.includes('beta') || version?.includes('alpha')) {
    versionColor = red;
  }
  const banners = [
    //     // Banner 2
    //     `
    // ${b}          ###                                  ${w}  # ###       #######  ${r}
    // ${b}         ###    #                            / ${w} /###     /       ###  ${r}
    // ${b}          ##   ###                          /  ${w}/  ###   /         ##  ${r}
    // ${b}          ##    #                          / ${w} ##   ###  ##        #   ${r}
    // ${b}          ##                              /  ${w}###    ###  ###          ${r}
    // ${b}   /##    ##  ###    ######      /###    ${w}##   ##     ## ## ###        ${r}
    // ${b}  / ###   ##   ###  /#######    / ###  / ${w}##   ##     ##  ### ###      ${r}
    // ${b} /   ###  ##    ## /      ##   /   ###/  ${w}##   ##     ##    ### ###    ${r}
    // ${b}##    ### ##    ##        /   ##    ##   ${w}##   ##     ##      ### /##  ${r}
    // ${b}########  ##    ##       /    ##    ##   ${w}##   ##     ##        #/ /## ${r}
    // ${b}#######   ##    ##      ###   ##    ##   ${w} ##  ##     ##         #/ ## ${r}
    // ${b}##        ##    ##       ###  ##    ##   ${w}  ## #      /           # /  ${r}
    // ${b}####    / ##    ##        ### ##    /#   ${w}   ###     /  /##        /   ${r}
    // ${b} ######/  ### / ### /      ##  ####/ ##  ${w}    ######/  /  ########/    ${r}
    // ${b}  #####    ##/   ##/       ##   ###   ## ${w}      ###   /     #####      ${r}
    // ${b}                           /             ${w}            |                ${r}
    // ${b}                          /              ${w}             \)              ${r}
    // ${b}                         /               ${w}                             ${r}
    // ${b}                        /                ${w}                             ${r}
    // `,

    //     // Banner 3
    //     `
    // ${b}      :::::::::::::      ::::::::::::::::::::    ::: ${w}    ::::::::  :::::::: ${r}
    // ${b}     :+:       :+:          :+:         :+:   :+: :+:${w}  :+:    :+::+:    :+: ${r}
    // ${b}    +:+       +:+          +:+        +:+   +:+   +:+${w} +:+    +:++:+         ${r}
    // ${b}   +#++:++#  +#+          +#+       +#+   +#++:++#++:${w}+#+    +:++#++:++#++   ${r}
    // ${b}  +#+       +#+          +#+      +#+    +#+     +#+${w}+#+    +#+       +#+    ${r}
    // ${b} #+#       #+#          #+#     #+#     #+#     #+##${w}+#    #+##+#    #+#     ${r}
    // ${b}##########################################     #### ${w}#######  ########       ${r}`,

    `
${b}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⣿⠀⠙⠛⠿⢤⣦⣐⠀${w}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀${r}
${b}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣐⣿⣿⢰⡀⠀⠀⠀⠈⠻⠀${w}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀${r}
${b}⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⠤⠾⠛⠛⣿⣶⣇⠀⠀⡆⠀⠀⠀${w}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀${r}
${b}⠀⠀⢰⣋⡳⡄⠀⠀⠀⢨⣭⡀⠀⡤⠀⣀⣝⢿⣶⣿⡅⠀⠀⠀${w}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀${r}
${b}⠀⠀⢸⣯⠀⣇⠀⠀⠀⣼⣿⣿⣆⢷⣴⣿⣿⡏⣛⡉⠀⠀⠀⠀${w}⢸⣿⣿⣿⣿⣿⣿⢸⣿⣿⠀⠀⠀⠀⠀⣿⣿⡇⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⣾⣿⣿⣧⠀⠀⠀⢸⠟⢀⣴⣿⣿⣿⣿⣦⡀⣠⣾⣿⣿⣿⣿⣦⡙⢿⠀${r}
${b}⠀⠀⠀⠙⢷⣮⠀⠀⢸⣿⣿⣿⣿⣷⣯⣟⣏⣼⣷⣅⠾⡟⠀⠀${w}⢸⣿⣇⣀⣀⣀⠀⢸⣿⣿⠀⠀⠀⠀⠀⣿⣿⡇⠀⠀⠀⣠⣿⣿⠟⠁⠀⠀⣼⣿⡟⣿⣿⣆⠀⠀⠀⠀⣿⣿⠋⠀⠈⠻⣿⡇⣿⣿⣅⣀⣀⡛⠛⠃⠀⠀${r}
${b}⠀⠀⠀⠀⠀⠁⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠋⠀⠀⠀⠀${w}⢸⣿⡿⠿⠿⠿⠀⢸⣿⣿⠀⠀⠀⠀⠀⣿⣿⡇⠀⣠⣾⣿⠟⠁⠀⠀⠀⣰⣿⣿⣁⣸⣿⣿⡄⠀⠀⠀⣿⣿⡀⠀⠀⢘⣿⣿⢈⣛⠿⠿⠿⣿⣷⡄⠀⠀${r}
${b}⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⣉⡟⠀⠀⠀⠀⠀${w}⢸⣿⣧⣤⣤⣤⣤⢸⣿⣿⣦⣤⣤⣤⡄⣿⣿⡇⣾⣿⣿⣧⣤⣤⣤⡄⢰⣿⣿⠟⠛⠛⠻⣿⣿⡄⢠⡀⠻⣿⣿⣦⣴⣿⣿⠇⢿⣿⣦⣤⣤⣿⣿⠇⣠⠀${r}
${b}⠀⠀⠀⠀⠀⠀⠀⠀⢰⡈⠛⠿⣿⣿⣿⣿⣿⠋⠀⣦⣤⣄⠀⠀${w}⠘⠛⠛⠛⠛⠛⠛⠈⠛⠛⠛⠛⠛⠛⠃⠛⠛⠃⠛⠛⠛⠛⠛⠛⠛⠃⠛⠛⠃⠀⠀⠀⠀⠙⠛⠃⠘⠛⠀⠈⠛⠛⠛⠛⠁⠀⠀⠙⠛⠛⠛⠛⠁⠚⠛⠀${r}
${b}⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⡦⠀⠀⠉⠛⠿⠃⠀⠀⠀⠁⠉⠀⠀${w}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀${r}
${b}⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⢾⡃⠀⠀${w}⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀${r}
`,
  ];

  // Randomly select and log one banner
  const randomBanner = banners[Math.floor(Math.random() * banners.length)];

  console.log(randomBanner);

  if (version) {
    // log the version
    console.log(`${versionColor}Version: ${version}${r}`);
  }
}
