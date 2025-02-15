// pipeline-render.js

(function() {

  function buildStageDOM(stage, index) {
    const configContainer = document.createElement("div");
    configContainer.classList.add("stage-config-container");

    const leftCol = document.createElement("div");
    leftCol.classList.add("stage-config-left");

    const middleCol = document.createElement("div");
    middleCol.classList.add("stage-config-middle");

    configContainer.appendChild(leftCol);
    configContainer.appendChild(middleCol);

    function onConfigChange(clearSubStages = false) {
      if (clearSubStages) {
        window.truncatePipelineFrom(index);
      }
      renderStages();
      updatePipeline();
    }

    function addLabelInputPair(labelText, inputEl) {
      const row = document.createElement("div");
      row.classList.add("label-input-row");

      const lbl = document.createElement("label");
      lbl.textContent = labelText;
      lbl.classList.add("label-col");

      const inpWrapper = document.createElement("div");
      inpWrapper.classList.add("input-col");
      inpWrapper.appendChild(inputEl);

      row.appendChild(lbl);
      row.appendChild(inpWrapper);

      leftCol.appendChild(row);
    }

    const { stages } = pipelineState;
    const hasFarm    = stages.some(s => s.type === "Farm");
    const hasCompost = stages.some(s => s.type === "Compost");
    {
      let selType = document.createElement("select");

      if (index === 0) {
        const optFarm = document.createElement("option");
        optFarm.value = "Farm";
        optFarm.textContent = "Farm / Item Stream";
        optFarm.selected = (stage.type === "Farm");
        selType.appendChild(optFarm);
      } else {
        if (!hasFarm || stage.type === "Farm") {
          const optFarm = document.createElement("option");
          optFarm.value = "Farm";
          optFarm.textContent = "Farm / Item Stream";
          optFarm.selected = (stage.type === "Farm");
          selType.appendChild(optFarm);
        }
        if (index > 0) {
          const prevOut = stages[index - 1].outputItem;
          const isComp = window.itemData[prevOut]?.compostable;
          if (isComp && (!hasCompost || stage.type === "Compost")) {
            const optComp = document.createElement("option");
            optComp.value = "Compost";
            optComp.textContent = "Compost";
            optComp.selected = (stage.type === "Compost");
            selType.appendChild(optComp);
          }
          if (window.recipeBook[prevOut] && Object.keys(window.recipeBook[prevOut]).length > 0) {
            const optCraft = document.createElement("option");
            optCraft.value = "Craft";
            optCraft.textContent = "Craft";
            optCraft.selected = (stage.type === "Craft");
            selType.appendChild(optCraft);
          }
        }
      }

      selType.addEventListener("change", e => {
        let chosen = e.target.value;
        if (chosen === "Farm" && hasFarm && stage.type !== "Farm") {
          console.warn("Farm already exists. Reverting...");
          e.target.value = stage.type;
          return;
        }
        if (chosen === "Compost" && hasCompost && stage.type !== "Compost") {
          console.warn("Compost already exists. Reverting...");
          e.target.value = stage.type;
          return;
        }
        stage.type = chosen;
        if (chosen === "Farm") {
          stage.farmMode = "calculated";
          stage.inputItem = "";
          stage.outputItem = "cactus";
          stage.ratioX = 1;
          stage.ratioY = 1;
          stage.qtyPlanted = 100;
          stage.growthSec = 1080;
          stage.efficiency = 1.0;
          stage.itemsCollected = 54;
          stage.timeMeasured = 10;
        } else if (chosen === "Compost") {
          stage.inputItem = (index > 0) ? stages[index - 1].outputItem : "cactus";
          stage.outputItem = "bonemeal";
          stage.ratioX = 1;
          stage.ratioY = 1;
          delete stage.farmMode;
          delete stage.qtyPlanted;
          delete stage.growthSec;
          delete stage.efficiency;
          delete stage.itemsCollected;
          delete stage.timeMeasured;
          window.maybeAutoFillRecipe(stage);
        } else if (chosen === "Craft") {
          stage.inputItem = (index > 0) ? stages[index - 1].outputItem : "cactus";
          stage.outputItem = "";
          stage.ratioX = 1;
          stage.ratioY = 1;
          delete stage.farmMode;
          delete stage.qtyPlanted;
          delete stage.growthSec;
          delete stage.efficiency;
          delete stage.itemsCollected;
          delete stage.timeMeasured;
          if (window.recipeBook[stage.inputItem]) {
            const poss = Object.keys(window.recipeBook[stage.inputItem]);
            if (poss.length > 0) {
              stage.outputItem = poss[0];
              let { x, y } = window.recipeBook[stage.inputItem][poss[0]];
              stage.ratioX = x;
              stage.ratioY = y;
            }
          }
        }
        onConfigChange(true);
      });

      addLabelInputPair("Type:", selType);
    }

    if (stage.type === "Farm") {
      let modeRow = document.createElement("div");
      modeRow.classList.add("stage-row");
      modeRow.innerHTML = `
        <label>Mode:</label>
        <div class="mode-options">
          <label>
            <input type="radio" name="farmMode_${stage.id}" value="calculated">
            Calculated
          </label>
          <label>
            <input type="radio" name="farmMode_${stage.id}" value="measured">
            Measured
          </label>
        </div>
      `;
      const radios = modeRow.querySelectorAll('input[type="radio"]');
      radios.forEach(radio => {
        radio.addEventListener("change", () => {
          stage.farmMode = radio.value;
          onConfigChange();
        });
      });
      if (stage.farmMode === "measured") {
        modeRow.querySelector('input[value="measured"]').checked = true;
      } else {
        modeRow.querySelector('input[value="calculated"]').checked = true;
      }
      middleCol.appendChild(modeRow);

      {
        let selFarm = document.createElement("select");
        Object.keys(window.itemData).forEach(k => {
          let opt = document.createElement("option");
          opt.value = k;
          opt.textContent = window.itemData[k].name;
          if (k === stage.outputItem) opt.selected = true;
          selFarm.appendChild(opt);
        });
        selFarm.addEventListener("change", e => {
          if (stage.outputItem !== e.target.value) {
            stage.outputItem = e.target.value;
            stage.growthSec = window.itemData[e.target.value]?.farmGrowthSeconds || 100;
            onConfigChange(true);
          }
        });
        addLabelInputPair("Farmed Item:", selFarm);
      }

      if (stage.farmMode === "calculated") {
        {
          let inp = document.createElement("input");
          inp.type = "number";
          inp.style.width = "80px";
          inp.value = stage.qtyPlanted;
          inp.addEventListener("blur", ev => {
            stage.qtyPlanted = parseFloat(ev.target.value) || 0;
            onConfigChange();
          });
          addLabelInputPair("Qty Planted:", inp);
        }
        {
          let inp = document.createElement("input");
          inp.type = "number";
          inp.step = "0.01";
          inp.style.width = "80px";
          inp.value = stage.efficiency;
          inp.addEventListener("blur", ev => {
            stage.efficiency = parseFloat(ev.target.value) || 0;
            onConfigChange();
          });
          addLabelInputPair("Efficiency (0-1):", inp);
        }
        {
          let inp = document.createElement("input");
          inp.type = "number";
          inp.step = "0.01";
          inp.style.width = "80px";
          inp.value = stage.growthSec;
          inp.addEventListener("blur", ev => {
            stage.growthSec = parseFloat(ev.target.value) || 0;
            onConfigChange();
          });
          addLabelInputPair("Growth (sec/item):", inp);
        }
      } else {
        {
          let inp = document.createElement("input");
          inp.type = "number";
          inp.style.width = "80px";
          inp.value = stage.itemsCollected;
          inp.addEventListener("blur", ev => {
            stage.itemsCollected = parseFloat(ev.target.value) || 0;
            onConfigChange();
          });
          addLabelInputPair("Items Collected:", inp);
        }
        {
          let inp = document.createElement("input");
          inp.type = "number";
          inp.step = "0.01";
          inp.style.width = "80px";
          inp.value = stage.timeMeasured;
          inp.addEventListener("blur", ev => {
            stage.timeMeasured = parseFloat(ev.target.value) || 1;
            onConfigChange();
          });
          addLabelInputPair("Time Measured (min):", inp);
        }
      }

    } else if (stage.type === "Compost") {
      {
        let sel = document.createElement("select");
        let compKeys = Object.keys(window.itemData).filter(k => window.itemData[k].compostable);
        compKeys.forEach(k => {
          let opt = document.createElement("option");
          opt.value = k;
          opt.textContent = window.itemData[k].name;
          if (k === stage.inputItem) opt.selected = true;
          sel.appendChild(opt);
        });
        sel.disabled = true;
        addLabelInputPair("Input (Recipe):", sel);
      }
      {
        let outSel = document.createElement("select");
        let opt = document.createElement("option");
        opt.value = "bonemeal";
        opt.textContent = window.itemData["bonemeal"]?.name || "Bone Meal";
        opt.selected = true;
        outSel.appendChild(opt);
        outSel.disabled = true;
        addLabelInputPair("Output (Recipe):", outSel);
      }
      {
        let ratioWrapper = document.createElement("div");
        ratioWrapper.innerHTML = `
          <input type="number" step="0.01" style="width:80px;">
          <span style="font-weight:bold;">=></span>
          <input type="number" step="0.01" style="width:80px;">
        `;
        const [rx, ry] = ratioWrapper.querySelectorAll("input");
        rx.value = stage.ratioX;
        ry.value = stage.ratioY;
        rx.addEventListener("blur", e => {
          stage.ratioX = parseFloat(e.target.value) || 1;
          onConfigChange();
        });
        ry.addEventListener("blur", e => {
          stage.ratioY = parseFloat(e.target.value) || 1;
          onConfigChange();
        });
        addLabelInputPair("Ratio (X => Y):", ratioWrapper);
      }

    } else if (stage.type === "Craft") {
      {
        let sel = document.createElement("select");
        let singleOpt = document.createElement("option");
        singleOpt.value = stage.inputItem;
        singleOpt.textContent = window.itemData[stage.inputItem]?.name || stage.inputItem;
        singleOpt.selected = true;
        sel.appendChild(singleOpt);
        sel.disabled = true;
        addLabelInputPair("Input (Recipe):", sel);
      }
      {
        let outSel = document.createElement("select");
        let poss = window.recipeBook[stage.inputItem] ? Object.keys(window.recipeBook[stage.inputItem]) : [];
        if (poss.length === 0) {
          outSel.disabled = true;
        } else {
          poss.forEach(k => {
            let opt = document.createElement("option");
            opt.value = k;
            opt.textContent = window.itemData[k]?.name || k;
            if (k === stage.outputItem) opt.selected = true;
            outSel.appendChild(opt);
          });
        }
        outSel.addEventListener("change", e => {
          if (stage.outputItem !== e.target.value) {
            stage.outputItem = e.target.value;
            window.maybeAutoFillRecipe(stage);
            onConfigChange(true);
          }
        });
        addLabelInputPair("Output (Recipe):", outSel);
      }
      {
        let ratioWrapper = document.createElement("div");
        ratioWrapper.innerHTML = `
          <input type="number" step="0.01" style="width:80px;">
          <span style="font-weight:bold;">=></span>
          <input type="number" step="0.01" style="width:80px;">
        `;
        const [rx, ry] = ratioWrapper.querySelectorAll("input");
        rx.value = stage.ratioX;
        ry.value = stage.ratioY;
        rx.addEventListener("blur", e => {
          stage.ratioX = parseFloat(e.target.value) || 1;
          onConfigChange();
        });
        ry.addEventListener("blur", e => {
          stage.ratioY = parseFloat(e.target.value) || 1;
          onConfigChange();
        });
        addLabelInputPair("Ratio (X => Y):", ratioWrapper);
      }
    }

    return configContainer;
  }

  function renderStages() {
    window.syncStageInputs();
    const { stages } = pipelineState;
    const stagesContainer = document.getElementById("stagesContainer");
    stagesContainer.innerHTML = "";

    stages.forEach((stage, idx) => {
      const stageDiv = document.createElement("div");
      stageDiv.classList.add("stage-block");

      let titleStr = (idx === 0)
        ? `Stage 1 (Farm / Item Stream)`
        : `Stage ${idx + 1} (${stage.type})`;
      stageDiv.innerHTML = `<h3>${titleStr}</h3>`;

      const btnRemove = document.createElement("button");
      btnRemove.textContent = "Remove";
      btnRemove.classList.add("remove-btn");
      btnRemove.addEventListener("click", () => {
        window.removeStage(stage.id);
        renderStages();
        updatePipeline();
      });
      stageDiv.appendChild(btnRemove);

      let contentDiv = document.createElement("div");
      contentDiv.classList.add("stage-content");

      let configArea = buildStageDOM(stage, idx);
      contentDiv.appendChild(configArea);

      let resultsDiv = document.createElement("div");
      resultsDiv.classList.add("stage-results");
      resultsDiv.innerHTML = `<div class="inline-results"></div>`;
      contentDiv.appendChild(resultsDiv);

      stageDiv.appendChild(contentDiv);
      stagesContainer.appendChild(stageDiv);
    });

    window.savePipeline();
  }
  window.renderStages = renderStages;

})();
