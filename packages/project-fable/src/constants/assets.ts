export const avatars = [
  'https://emerald-patient-puffin-220.mypinata.cloud/ipfs/bafybeid2dqmzrvyx4wjsh4kuu52piggcry3adp7p2aepbvdhqgmiaeuv5q',
  'https://emerald-patient-puffin-220.mypinata.cloud/ipfs/bafybeifceh3rmg4ocaw62cmbyt2264huzxuckcgk6ryrpszuncdtl7oh5u',
  'https://emerald-patient-puffin-220.mypinata.cloud/ipfs/bafybeigrbt6qv4xvy46wgn77moaqut65tnwfzqhofhsx5c3gfa4pc47sjm',
];

export const getRandomAvatar = () => {
  return avatars[Math.floor(Math.random() * avatars.length)];
};
