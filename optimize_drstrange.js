const fs = require('fs');
const { Document, NodeIO } = require('@gltf-transform/core');
const { prune } = require('@gltf-transform/functions');
const { KHRMeshQuantization, KHRMaterialsUnlit, KHRTextureTransform } = require('@gltf-transform/extensions');

async function processGLB() {
  const io = new NodeIO();
  io.registerExtensions([KHRMeshQuantization, KHRMaterialsUnlit, KHRTextureTransform]);
  console.log('Reading GLB...');
  const document = await io.read('public/models/dr_strange-compressed.glb');
  
  const root = document.getRoot();
  let nodesDeleted = 0;

  root.listNodes().forEach((node) => {
    const name = (node.getName() || '').toLowerCase();
    if (
      name.includes('universe') || 
      name.includes('background') || 
      name.includes('particle') || 
      name.includes('plane') || 
      name.includes('portal') ||
      name.includes('mandala') 
    ) {
      node.dispose();
      nodesDeleted++;
    }
  });

  console.log(`Disposed ${nodesDeleted} nodes. Pruning unused resources...`);
  await document.transform(prune());
  
  console.log('Saving optimized GLB...');
  await io.write('public/models/dr_strange-optimized.glb', document);
  console.log('Done! Saved as dr_strange-optimized.glb');
}

processGLB().catch(console.error);
