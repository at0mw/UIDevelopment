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

const basicsModule = (() => {
  "use strict";

  // BEGIN::CHANGEAREA - your javascript for page module code goes here

  /**
   * Initialize Method
   */
  function onInit() {
    serviceModule.addEmulatorScenarioNoControlSystem(
      "./app/project/components/pages/basics/basics-emulator.json"
    );
    // Uncomment the below line and comment the above to load the emulator all the time.
    // serviceModule.addEmulatorScenario(
    //   "./app/project/components/pages/basics/basics-emulator.json"
    // );

    window.addEventListener("resize", handleShowSliderAutoInput);
    const slider_input = document.getElementById("slider_input");
    if (slider_input) {
      slider_input.addEventListener("input", handleShowSliderUserInput);
      slider_input.addEventListener("change", sendAnalogUpdate);
    }

    const buttonArea = document.querySelector(".button-box");
    buttonArea.addEventListener("click", handleButtonPress);
    const sendButton = document.getElementById("send-button");

    sendButton.addEventListener("click", sendSerialUpdate);
  }

  function handleButtonPress(event) {
    const clickedElement = event.target;
    if (clickedElement.classList.contains("button")) {
      const idParts = clickedElement.id.split(":");
      if (idParts.length === 2) {
        const clickedElementIdNumber = parseInt(idParts[1], 10);
        if (!isNaN(clickedElementIdNumber)) {
          customButtonPress(clickedElementIdNumber);
        }
      }
    }
  }

  function customButtonPress(idNumber) {
    sendSignal.sendActionPulse(idNumber.toString());
  }

  function sendAnalogUpdate(event) {
    const inputValue = event.target.value;
    const parsedValue = parseInt(inputValue, 10);
    sendSignal.sendAnalogSignal("1", parsedValue);
  }

  function sendSerialUpdate(event) {
    const textInput = document.getElementById("text-input");
    const message = textInput.value;
    sendSignal.sendStringSignal("1", message);

    const messageDisplay = document.getElementById("message-display");
    messageDisplay.textContent =
      "Last Message Sent to CrComLib on JoinId 1: " + message;
    textInput.value = "";
  }

  function handleShowSliderAutoInput() {
    showSliderValue(false);
  }

  function handleShowSliderUserInput() {
    showSliderValue(true);
  }

  function showSliderValue(showThumb) {
    const sliderInput = document.getElementById("slider_input");
    const sliderThumb = document.getElementById("slider_thumb");
    const sliderLine = document.getElementById("slider_line");

    if (sliderInput && sliderThumb && sliderLine) {
      if (showThumb) {
        revealThumbMovementVisuals(sliderThumb);
      }
      updateSliderAndThumbPosition(sliderInput, sliderThumb, sliderLine);
    }
  }

  let thumbDisappearTimeout;
  function revealThumbMovementVisuals(sliderThumb) {
    let thumbText = sliderThumb.querySelector(".thumb-text");
    thumbText.style.opacity = 1;
    if (thumbDisappearTimeout) {
      clearTimeout(thumbDisappearTimeout);
    }
    sliderThumb.classList.add("active");
    sliderThumb.style.opacity = "1";

    thumbDisappearTimeout = setTimeout(() => {
      thumbText.style.opacity = 0;
      sliderThumb.classList.remove("active");
    }, 1500);
  }

  function updateSliderAndThumbPosition(sliderInput, sliderThumb, sliderLine) {
    let thumbText = sliderThumb.querySelector(".thumb-text");
    thumbText.innerHTML = sliderInput.value;
    const bulletPosition = sliderInput.value / sliderInput.max,
      space = sliderInput.offsetWidth;

    sliderThumb.style.left = bulletPosition * space + "px";
    sliderLine.style.width = sliderInput.value + "%";
  }

  const subscribeInfoFeedback = CrComLib.subscribeState("s", "1", (value) => {
    console.log("Feedback CrComLib :::: String Join 1 ::: Value :: ", value);
    const messageDisplay = document.getElementById("message-display");
    messageDisplay.textContent = value;
  });

  /**
   * private method for page class initialization
   */
  let loadedSubId = CrComLib.subscribeState(
    "o",
    "ch5-import-htmlsnippet:basics-import-page",
    (value) => {
      if (value["loaded"]) {
        onInit();
        setTimeout(() => {
          CrComLib.unsubscribeState(
            "o",
            "ch5-import-htmlsnippet:basics-import-page",
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
