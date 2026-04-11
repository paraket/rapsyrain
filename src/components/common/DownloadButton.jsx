import React from 'react';
import { Download } from 'lucide-react';
import ActionButton from './ActionButton';

const DownloadButton = ({ onClick, fileName, loading = false }) => {
  return (
    <ActionButton 
      onClick={onClick} 
      loading={loading}
      variant="primary"
      className="bg-green-600 hover:bg-green-700 shadow-green-600/20"
    >
      <Download size={22} className="group-hover:translate-y-0.5 transition-transform duration-200" />
      <span>Download {fileName}</span>
    </ActionButton>
  );
};

export default DownloadButton;
