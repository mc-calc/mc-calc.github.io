// pipeline-calc.js

(function(){

  function updatePipeline() {
    window.syncStageInputs();

    const { stages, SHULKER_CAPACITY, DOUBLE_CHEST_CAPACITY } = window.pipelineState;
    let currentItemsPerMin = 0;
    let currentItemName = null;

    const stageBlocks = document.querySelectorAll(".stage-block");

    stages.forEach((stage, idx) => {
      let itemsPerMin=0;
      let outItem="";

      if (stage.type==="Farm") {
        outItem=stage.outputItem;
        if (stage.farmMode==="calculated") {
          if (stage.qtyPlanted>0 && stage.growthSec>0 && stage.efficiency>0) {
            const perSec=(stage.qtyPlanted/stage.growthSec)*stage.efficiency;
            itemsPerMin=perSec*60;
          } else {
            itemsPerMin=0;
          }
        } else {
          if (stage.itemsCollected>0 && stage.timeMeasured>0) {
            itemsPerMin=stage.itemsCollected/stage.timeMeasured;
          } else {
            itemsPerMin=0;
          }
        }
        currentItemsPerMin=itemsPerMin;
        currentItemName=outItem;
      }
      else if (stage.type==="Compost") {
        const inKey=stage.inputItem;
        outItem=stage.outputItem;
        if (inKey!==currentItemName) {
          itemsPerMin=0;
        } else {
          const rx=stage.ratioX||1;
          const ry=stage.ratioY||1;
          const isComp=window.itemData[inKey]?.compostable;
          itemsPerMin= isComp ? currentItemsPerMin*(ry/rx) : 0;
        }
        currentItemsPerMin=itemsPerMin;
        currentItemName=outItem;
      }
      else if (stage.type==="Craft") {
        const inKey=stage.inputItem;
        outItem=stage.outputItem;
        if (inKey!==currentItemName) {
          itemsPerMin=0;
        } else {
          const rx=stage.ratioX||1;
          const ry=stage.ratioY||1;
          itemsPerMin=currentItemsPerMin*(ry/rx);
        }
        currentItemsPerMin=itemsPerMin;
        currentItemName=outItem;
      }

      const minuteVal = itemsPerMin;
      const hourVal   = minuteVal*60;
      const dayVal    = hourVal*24;
      const weekVal   = dayVal*7;
      const monthVal  = dayVal*30;

      const stSize = window.itemData[outItem]?.stackSize||64;
      const minStacks = minuteVal/stSize;
      const hrStacks  = hourVal/stSize;
      const dayStacks = dayVal/stSize;
      const wkStacks  = weekVal/stSize;
      const moStacks  = monthVal/stSize;

      const minShulk=minuteVal/SHULKER_CAPACITY;
      const hrShulk=hourVal/SHULKER_CAPACITY;
      const dayShulk=dayVal/SHULKER_CAPACITY;
      const wkShulk=weekVal/SHULKER_CAPACITY;
      const moShulk=monthVal/SHULKER_CAPACITY;

      const minDC=minuteVal/DOUBLE_CHEST_CAPACITY;
      const hrDC=hourVal/DOUBLE_CHEST_CAPACITY;
      const dayDC=dayVal/DOUBLE_CHEST_CAPACITY;
      const wkDC=weekVal/DOUBLE_CHEST_CAPACITY;
      const moDC=monthVal/DOUBLE_CHEST_CAPACITY;

      const stageBlock = stageBlocks[idx];
      const resultsDiv = stageBlock.querySelector(".stage-results");
      resultsDiv.innerHTML="";

      const table = document.createElement("table");
      table.classList.add("results-table");
      table.innerHTML=`
        <thead>
          <tr>
            <th>Time</th>
            <th>Items</th>
            <th>Stacks (x${stSize})</th>
            <th>Shulkers</th>
            <th>D-Chest</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
      resultsDiv.appendChild(table);

      const tbody = table.querySelector("tbody");

      function addRow(label, items, stacks, shulk, dc) {
        const tr=document.createElement("tr");
        tr.innerHTML=`
          <td>${label}</td>
          <td>${formatNumberDynamic(items)}</td>
          <td>${formatNumberDynamic(stacks)}</td>
          <td>${formatNumberDynamic(shulk)}</td>
          <td>${formatNumberDynamic(dc)}</td>
        `;
        tbody.appendChild(tr);
      }

      if (window.showPerMinuteEl.checked) addRow("Minutely", minuteVal, minStacks, minShulk, minDC);
      if (window.showPerHourEl.checked)   addRow("Hourly",   hourVal, hrStacks, hrShulk, hrDC);
      if (window.showPerDayEl.checked)    addRow("Daily",    dayVal,  dayStacks, dayShulk, dayDC);
      if (window.showPerWeekEl.checked)   addRow("Weekly",   weekVal, wkStacks, wkShulk, wkDC);
      if (window.showPerMonthEl.checked)  addRow("Monthly",  monthVal, moStacks, moShulk, moDC);
    });

    window.savePipeline();
  }
  window.updatePipeline = updatePipeline;

  function formatNumberDynamic(num) {
    if (Number.isNaN(num)) return "0";
    const r = Math.round(num);
    if (Math.abs(num-r)<0.000001) return String(r);
    return num.toFixed(1);
  }
  window.formatNumberDynamic = formatNumberDynamic;

})();
