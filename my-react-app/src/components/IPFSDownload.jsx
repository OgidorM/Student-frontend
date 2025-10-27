const IPFSDownload = ({ cid, label = 'Download Material' }) => {
  if (!cid) return null;

  const ipfsGatewayUrl = import.meta.env.VITE_IPFS_GATEWAY_URL;
  const downloadUrl = `${ipfsGatewayUrl}/ipfs/${cid}`;

  return (
    <div className="ipfs-download">
      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="download-link"
      >
        📥 {label}
      </a>
    </div>
  );
};

export default IPFSDownload;


