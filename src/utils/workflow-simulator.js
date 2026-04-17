/**
 * Simulates the state of the file pool at any given step in the pipeline.
 * Does not perform ACTUAL PDF operations, just name and ID tracking.
 * 
 * @param {Array} initialFiles - Initial uploaded files.
 * @param {Array} nodes - Pipeline nodes.
 * @returns {Array<Array>} Array of pools, index matching step index.
 */
export function simulatePipeline(initialFiles, nodes) {
  let pool = initialFiles.map(f => ({
    id: f.id,
    name: f.name,
    sourceId: f.id,
    type: 'original'
  }));

  const pools = [];

  for (let i = 0; i < nodes.length; i++) {
    pools.push([...pool]); // Pool BEFORE node i

    const node = nodes[i];
    const newPool = [];

    switch (node.type) {
      case 'split':
        for (const file of pool) {
          // Check if this file has a specific split configuration
          const config = node.config?.perFile?.[file.id] || node.config;
          const numRanges = config?.ranges?.length || 1;
          
          if (numRanges > 1) {
            for (let r = 0; r < numRanges; r++) {
              newPool.push({
                id: `node_${i}_split_${r}_${file.id}`,
                name: `${file.name.replace('.pdf', '')}_part_${r + 1}.pdf`,
                sourceId: file.id,
                type: 'derived'
              });
            }
          } else {
            newPool.push(file);
          }
        }
        pool = newPool;
        break;

      case 'reorder':
        // Reordering doesn't change pool size, but we track it
        pool = pool.map(file => ({
            ...file,
            id: `node_${i}_reorder_${file.id}` // Update ID to mark it has been touched
        }));
        break;

      case 'merge':
        if (pool.length > 0) {
          pool = [{
            id: `node_${i}_merged`,
            name: `merged_workflow_${i + 1}.pdf`,
            sourceId: 'multiple',
            type: 'derived'
          }];
        }
        break;

      default:
        break;
    }
  }

  // Push final pool state
  pools.push([...pool]);

  return pools;
}
