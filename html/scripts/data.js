// data.js

window.itemData = {
  bamboo: {
    name: "Bamboo",
    farmGrowthSeconds: 204.8,
    compostable: false,
    stackSize: 64
  },
  cactus: {
    name: "Cactus",
    farmGrowthSeconds: 1080, 
    compostable: true,
    stackSize: 64,
    compostRatio: { x: 14, y: 1 }
  },
  potato: {
    name: "Potato",
    farmGrowthSeconds: 1200,
    compostable: true,
    stackSize: 64,
    compostRatio: { x: 8, y: 1 }
  },
  wheat: {
    name: "Wheat",
    farmGrowthSeconds: 600,
    compostable: true,
    stackSize: 64,
    compostRatio: { x: 3, y: 1 }
  },
  carrot: {
    name: "Carrot",
    farmGrowthSeconds: 800,
    compostable: true,
    stackSize: 64,
    compostRatio: { x: 8, y: 1 }
  },
  beetroot: {
    name: "Beetroot",
    farmGrowthSeconds: 800,
    compostable: true,
    stackSize: 64,
    compostRatio: { x: 8, y: 1 }
  },
  melon: {
    name: "Melon Slice",
    farmGrowthSeconds: 1200,
    compostable: false,
    stackSize: 64
  },
  melon_block: {
    name: "Melon Block",
    compostable: false,
    stackSize: 64
  },
  sugar_cane: {
    name: "Sugar Cane",
    farmGrowthSeconds: 900,
    compostable: true,
    stackSize: 64,
    compostRatio: { x: 3, y: 1 }
  },
  paper: {
    name: "Paper",
    compostable: false,
    stackSize: 64
  },
  pumpkin: {
    name: "Pumpkin",
    farmGrowthSeconds: 1800,
    compostable: false,
    stackSize: 64
  },
  nether_wart: {
    name: "Nether Wart",
    farmGrowthSeconds: 900,
    compostable: false,
    stackSize: 64
  },
  cocoa: {
    name: "Cocoa Beans",
    farmGrowthSeconds: 1200,
    compostable: false,
    stackSize: 64
  },
  bonemeal: {
    name: "Bone Meal",
    compostable: false,
    stackSize: 64
  },
  boneblock: {
    name: "Bone Block",
    compostable: false,
    stackSize: 64
  },
  bamboo_block: {
    name: "Bamboo Block",
    compostable: false,
    stackSize: 64
  },
  bamboo_plank: {
    name: "Bamboo Plank",
    compostable: false,
    stackSize: 64
  },
  stick: {
    name: "Stick",
    compostable: false,
    stackSize: 64
  },
  chest: {
    name: "Chest",
    compostable: false,
    stackSize: 64
  }
};

window.recipeBook = {
  bonemeal: {
    boneblock: { x: 9, y: 1 },
  },
  boneblock: {
    bonemeal: { x: 1, y: 9 },
  },
  bamboo: {
    bamboo_block: { x: 9, y: 1 },
    stick:        { x: 2, y: 1 },
  },
  bamboo_block: {
    bamboo_plank: { x: 1, y: 4 }
  },
  bamboo_plank: {
    chest: { x: 8, y: 1 }
  },
  wheat: {
    bread: { x: 3, y: 1 }
  },
  melon: {
    melon_block: { x: 9, y: 1 }
  },
  sugar_cane: {
    paper: { x: 3, y: 1 }
  }
};
