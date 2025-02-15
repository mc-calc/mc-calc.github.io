// pipeline-logic.js

(function() {
  const SHULKER_CAPACITY = 1728;
  const DOUBLE_CHEST_CAPACITY = 3456;

  // Our pipeline state
  let stages = [];
  let nextStageId = 1;

  // Expose pipelineState so other files can read/write
  window.pipelineState = {
    stages,
    nextStageId,
    SHULKER_CAPACITY,
    DOUBLE_CHEST_CAPACITY
  };

  // Create a new stage object
  function createStageObject(type = "Farm") {
    let st = {
      id: pipelineState.nextStageId++,
      type,
      inputItem: "",
      outputItem: "",
      ratioX: 1,
      ratioY: 1
    };
    if (type === "Farm") {
      st.farmMode = "calculated";
      st.outputItem = "cactus";
      st.qtyPlanted = 100;
      st.growthSec = 1080;
      st.efficiency = 1.0;
      st.itemsCollected = 54;
      st.timeMeasured = 10;
    }
    return st;
  }
  window.createStageObject = createStageObject;

  // Add a new stage, enforcing single farm & single compost
  function addStage(type = "Farm") {
    const { stages } = pipelineState;

    // If no stages => must be Farm
    if (stages.length === 0 && type !== "Farm") {
      type = "Farm";
    }
    // Single farm
    if (type === "Farm" && stages.some(s => s.type === "Farm")) {
      console.warn("Farm already exists. Skipping second farm.");
      return;
    }
    // Single compost
    if (type === "Compost" && stages.some(s => s.type === "Compost")) {
      console.warn("Compost already exists. Skipping second compost.");
      return;
    }

    const newSt = createStageObject(type);
    if (stages.length > 0 && type !== "Farm") {
      newSt.inputItem = stages[stages.length - 1].outputItem;
    }

    // If compost => set output to bone meal and auto-fill compost ratio
    if (type === "Compost") {
      newSt.outputItem = "bonemeal";
      maybeAutoFillRecipe(newSt);
    }
    // If craft => maybe auto-fill from recipeBook
    else if (type === "Craft") {
      if (window.recipeBook[newSt.inputItem]) {
        let outs = Object.keys(window.recipeBook[newSt.inputItem]);
        if (outs.length > 0) {
          newSt.outputItem = outs[0];
          let { x, y } = window.recipeBook[newSt.inputItem][outs[0]];
          newSt.ratioX = x;
          newSt.ratioY = y;
        }
      }
    }

    stages.push(newSt);
  }
  window.addStage = addStage;

  // Remove a stage by ID
  function removeStage(stageId) {
    pipelineState.stages = pipelineState.stages.filter(st => st.id !== stageId);
  }
  window.removeStage = removeStage;

  // Clear localStorage, reset pipeline with 1 farm
  function resetPipeline() {
    localStorage.removeItem("minecraftPipeline");
    pipelineState.stages = [];
    pipelineState.nextStageId = 1;
    addStage("Farm");
  }
  window.resetPipeline = resetPipeline;

  // If input->output is known in recipeBook or via compostRatio, auto-fill ratio
  function maybeAutoFillRecipe(stage) {
    const inKey = stage.inputItem;
    // For Compost stages, use the compostRatio from itemData if available.
    if (stage.type === "Compost") {
      const compostRatio = window.itemData[inKey]?.compostRatio;
      if (compostRatio) {
        stage.ratioX = compostRatio.x;
        stage.ratioY = compostRatio.y;
      } else {
        // Fallback to default values if compostRatio is not defined.
        stage.ratioX = 1;
        stage.ratioY = 1;
      }
    } else if (window.recipeBook[inKey] && window.recipeBook[inKey][stage.outputItem]) {
      const { x, y } = window.recipeBook[inKey][stage.outputItem];
      stage.ratioX = x;
      stage.ratioY = y;
    }
  }
  window.maybeAutoFillRecipe = maybeAutoFillRecipe;

  // Make sure non-first stage input is previous stage's output,
  // and for compost stages, auto-fill ratio from itemData.

  function syncStageInputs() {
    const { stages } = pipelineState;
    stages.forEach((st, i) => {
      if (i > 0 && st.type !== "Farm") {
        st.inputItem = stages[i - 1].outputItem;
        // If the previous stage's output is compostable and this stage was set to Craft,
        // force it to Compost so that the compost ratio is used.
        if (window.itemData[st.inputItem]?.compostable && st.type === "Craft") {
          st.type = "Compost";
          st.outputItem = "bonemeal";
          window.maybeAutoFillRecipe(st);
        }
      }
      if (st.type === "Compost") {
        st.outputItem = "bonemeal";
        window.maybeAutoFillRecipe(st);
      }
    });
  }
  window.syncStageInputs = syncStageInputs;

  function truncatePipelineFrom(i) {
    const { stages } = pipelineState;
    if (i < stages.length - 1) {
      pipelineState.stages = stages.slice(0, i + 1);
    }
  }
  window.truncatePipelineFrom = truncatePipelineFrom;

  function savePipeline() {
    const { stages, nextStageId } = pipelineState;
    localStorage.setItem("minecraftPipeline", JSON.stringify({ stages, nextStageId }));
  }
  window.savePipeline = savePipeline;

  function loadPipeline() {
    let saved = localStorage.getItem("minecraftPipeline");
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        if (parsed.stages && Array.isArray(parsed.stages)) {
          pipelineState.stages = parsed.stages;
          pipelineState.nextStageId = parsed.nextStageId || 1;
        }
      } catch(e) {
        console.warn("Failed to parse pipeline from localStorage:", e);
      }
    }
  }
  window.loadPipeline = loadPipeline;

})();
