/**
 * Copyright (C) 2023 to the present, Crestron Electronics, Inc.
 * All rights reserved.
 * No part of this software may be reproduced in any form, machine
 * or natural, without the express written consent of Crestron Electronics.
 * Use of this source code is subject to the terms of the Crestron Software License Agreement
 * under which you licensed this source code.
 *
 * This code was automatically generated by Crestron's code generation tool.
 */
/*jslint es6 */
/*global serviceModule, CrComLib */

const objectsModule = (() => {
  "use strict";

  // BEGIN::CHANGEAREA - your javascript for page module code goes here

  /**
   * Initialize Method
   */
  function onInit() {
    //    serviceModule.addEmulatorScenarioNoControlSystem("./app/project/components/pages/objects/objects-emulator.json");
    // Uncomment the below line and comment the above to load the emulator all the time.
    serviceModule.addEmulatorScenario(
      "./app/project/components/pages/objects/objects-emulator.json"
    );
    const listBackButtonElement = document.getElementById(backButtonId);
    const listForwardButtonElement = document.getElementById(forwardButtonId);

    if (listBackButtonElement) {
      listBackButtonElement.addEventListener("click", prevPage);
    }

    if (listForwardButtonElement) {
      listForwardButtonElement.addEventListener("click", nextPage);
    }
  }

  /* ============================ Dynamic Presets Script Start ============================ */
  const dynamicListButtonId = ".demo-list-dynamic";
  const dynamicMenuId = "demo-dynamic-menu";
  const dynamicListId = "demo-dynamic-presets";
  const editableButtonId = "#editable-icons";
  const backButtonId = "demo-back-button";
  const forwardButtonId = "demo-forward-button";
  const itemsPerPage = 5;
  let presetManager;

  function createPresets(presetsConfig) {
    // const shadePresetContainer = document.getElementById(dynamicListId);
    // const presetsArray = generateShadePresetHTML(presetsConfig);

    presetManager = new DynamicListMenuLogic(
      "demo",
      itemsPerPage
    );
    // presetManager = new DynamicListMenuLogic('shade');
    presetManager.createDynamicPresets(presetsConfig);
    presetManager.onPresetSelected("presetSelected", handlePresetSelected);
  }

  function handlePresetSelected(event) {
    const presetId = event.detail.presetId;
    console.log("Preset Selected........", presetId);
  }

  function nextPage() {
    if (presetManager) {
      presetManager.moveForwardPage();
    }
  }

  function prevPage() {
    if (presetManager) {
      presetManager.moveBackwardPage();
    }
  }

  // === Subscribe to Shade Slider Preset Feedback and Handle ===
  const shadePresetConfigSubscription = CrComLib.subscribeState(
    "s",
    "22",
    (value) => {
      parsePresetConfigJsonString(value);
    }
  );

  function isValidShadePresetConfig(obj) {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "id" in obj &&
      "label" in obj &&
      "order" in obj &&
      typeof obj.id === "number" &&
      typeof obj.label === "string" &&
      typeof obj.order === "number"
    );
  }

  function parsePresetConfigJsonString(presetConfigJson) {
    console.log(
      "Feedback CrComLib :::: Shade Control ::: Receiving Preset Config Feedback :: Value: ",
      presetConfigJson
    );
    if (presetConfigJson && presetConfigJson !== "") {
      try {
        const parsedObjects = JSON.parse(presetConfigJson);

        if (
          Array.isArray(parsedObjects) &&
          parsedObjects.every(isValidShadePresetConfig)
        ) {
          createPresets(parsedObjects);
        } else {
          console.error("Parsed objects do not match the expected structure.");
        }
      } catch (error) {
        console.error("Error parsing input:", error);
      }
    }
  }
  /* ============================ Dynamic Presets Script End ============================ */

  /**
   * private method for page class initialization
   */
  let loadedSubId = CrComLib.subscribeState(
    "o",
    "ch5-import-htmlsnippet:objects-import-page",
    (value) => {
      if (value["loaded"]) {
        onInit();
        setTimeout(() => {
          CrComLib.unsubscribeState(
            "o",
            "ch5-import-htmlsnippet:objects-import-page",
            loadedSubId
          );
          loadedSubId = "";
        });
      }
    }
  );

  /**
   * All public method and properties are exported here
   */
  return {};

  // END::CHANGEAREA
})();
