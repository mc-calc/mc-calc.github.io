// main.js

(function(){
  window.showPerMinuteEl = document.getElementById("showPerMinute");
  window.showPerHourEl   = document.getElementById("showPerHour");
  window.showPerDayEl    = document.getElementById("showPerDay");
  window.showPerWeekEl   = document.getElementById("showPerWeek");
  window.showPerMonthEl  = document.getElementById("showPerMonth");

  function saveCheckboxState() {
      const checkboxState = {
         showPerMinute: window.showPerMinuteEl.checked,
         showPerHour: window.showPerHourEl.checked,
         showPerDay: window.showPerDayEl.checked,
         showPerWeek: window.showPerWeekEl.checked,
         showPerMonth: window.showPerMonthEl.checked,
      };
      localStorage.setItem("checkboxState", JSON.stringify(checkboxState));
  }

  function loadCheckboxState() {
      const saved = localStorage.getItem("checkboxState");
      if (saved) {
         try {
             const state = JSON.parse(saved);
             window.showPerMinuteEl.checked = state.showPerMinute;
             window.showPerHourEl.checked = state.showPerHour;
             window.showPerDayEl.checked = state.showPerDay;
             window.showPerWeekEl.checked = state.showPerWeek;
             window.showPerMonthEl.checked = state.showPerMonth;
         } catch (e) {
             console.warn("Error loading checkbox state:", e);
         }
      }
  }

  function resetCheckboxState() {
      window.showPerMinuteEl.checked = true;
      window.showPerHourEl.checked = true;
      window.showPerDayEl.checked = true;
      window.showPerWeekEl.checked = false;
      window.showPerMonthEl.checked = false;
      saveCheckboxState();
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.loadPipeline();
    loadCheckboxState();

    if (pipelineState.stages.length === 0) {
      window.addStage("Farm");
    }
    window.renderStages();
    window.updatePipeline();
  });

  ["showPerMinute", "showPerHour", "showPerDay", "showPerWeek", "showPerMonth"]
    .forEach(id => {
      document.getElementById(id).addEventListener("change", () => {
        window.updatePipeline();
        saveCheckboxState();
      });
    });

  document.getElementById("addStageBtn").addEventListener("click", () => {
    if (pipelineState.stages.length === 0) {
      window.addStage("Farm");
    } else {
      window.addStage("Craft");
    }
    window.renderStages();
    window.updatePipeline();
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    window.resetPipeline();
    resetCheckboxState();
    window.renderStages();
    window.updatePipeline();
  });

})();
