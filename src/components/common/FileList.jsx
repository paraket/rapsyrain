import { motion, AnimatePresence, Reorder } from 'framer-motion';
import FileCard from './FileCard';

const FileList = ({ 
  files, 
  onRemove, 
  onReorder, 
  onMoveUp, 
  onMoveDown, 
  onSelect,
  activeId = null,
  showReorder = false 
}) => {
  if (files.length === 0) return null;

  return (
    <div className="w-full">
      <Reorder.Group 
        axis="y" 
        values={files} 
        onReorder={onReorder} 
        className="grid gap-3"
      >
        <AnimatePresence initial={false}>
          {files.map((item, index) => (
            <Reorder.Item
              key={item.id}
              value={item}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative min-w-0"
            >
              <FileCard 
                file={item.file} 
                index={index} 
                onRemove={onRemove} 
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                onSelect={(idx) => onSelect && onSelect(files[idx])}
                isActive={activeId === item.id}
                showReorder={showReorder}
                isFirst={index === 0}
                isLast={index === files.length - 1}
              />
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
};

export default FileList;
