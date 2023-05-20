import React from 'react';
import { TreeView, TreeItem } from '@mui/lab';
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { styled } from '@mui/system';
import { Folder, InsertDriveFile } from '@mui/icons-material';

// Transforms flat list into a tree structure
const parseFileTree = (files) => {
  const root = { name: '/', children: [] };
  for (const file of files) {
      const pathParts = file.value.split('/');
      let currentPart = root;
      for (const part of pathParts) {
          let existingPart = currentPart.children.find((child) => child.name === part);
          if (!existingPart) {
              existingPart = { name: part, children: [] };
              currentPart.children.push(existingPart);
          }
          currentPart = existingPart;
      }
      currentPart.file = file; // store original file object
  }
  return root;
};

const StyledTreeView = styled(TreeView)({
  height: 240,
  flexGrow: 1,
  maxWidth: 400,
});


const FileTreeItem = ({ node, onClick }) => {
  const handleNodeClick = (event, value) => {
    if(node.file) {
      onClick(node.file.value.replace("/", "%2F"));
      event.stopPropagation();
    }
  };

  return (
    <TreeItem
      nodeId={node.file ? node.file.value : node.name}
      label={
        node.file ? (
          <span onClick={(event) => handleNodeClick(event, node.file.value)}>
            <InsertDriveFile color="action" fontSize="inherit" />
            {node.file.label}
          </span>
        ) : (
          <>
            <Folder color="action" fontSize="inherit" />
            {node.name}
          </>
        )
      }
    >
      {node.children.map((childNode, i) => (
        <FileTreeItem key={i} node={childNode} onClick={onClick} />
      ))}
    </TreeItem>
  );
};

const FileTree = ({ files, onFileClick }) => {
  const classes = StyledTreeView;
  const root = parseFileTree(files);

  return (
    <TreeView
      className={classes.root}
      defaultCollapseIcon={<ArrowBackIosIcon />}
      defaultExpandIcon={<ArrowForwardIosIcon />}
    >
      {root.children.map((node, i) => (
        <FileTreeItem key={i} node={node} onClick={onFileClick} />
      ))}
    </TreeView>
  );
};

export default FileTree;
