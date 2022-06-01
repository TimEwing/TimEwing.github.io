$(document).ready(function() {
  // On initial load, redirect to /welcome
  let welcomePlayed = sessionStorage.getItem("welcomePlayed");
  if(!welcomePlayed && window.location.pathname == '/') {
    // first time loaded!
    sessionStorage.setItem("welcomePlayed", 1);
    window.location.replace("/welcome");
  }

  // Defaults
  let typingSpeed = 55; // ms per char

  /// welcome.html
  /// Functions for the typewriter effect in the pseudo-console
  // Helper for timeout with callable trigger
  function setTriggerTimeout(handler, delay, ...args) {
    let timeoutFunction = setTimeout(handler, delay, ...args);
    // Return an object that can be called to cancel the delay
    return {
      trigger: function() {
        clearTimeout(timeoutFunction);
        return handler(...args);
      }
    }
  }

  // Skip animation button
  let consoleDisabled = false;
  let currentAnimation = null;
  $("#skip-animation").click(function () {
    // Set the consoleDisabled let to true; the rest is handled in the typing functions
    consoleDisabled = true;
    // If the animation is in the middle of a delay, trigger it now.
    currentAnimation.trigger();
  });

  function consoleNewline(contentTarget) {
    // Add br to the end of the previous line
    if(contentTarget != null) {
      contentTarget.append("<br>");
    }
    // Add new line's element
    $("#console").append("<span></span>");

    let currentLine = $("#console").children().last();
    // Add newline symbol
    contentTarget = $("#template-newline").clone().attr("id", "").appendTo(currentLine);
    // Move cursor, or add one if it doesn't exist
    if($("#cursor").length) {
      $("#cursor").appendTo(currentLine);
    }
    else {
      currentLine.append($("#template-cursor").clone().attr("id", "cursor"));
    }
    return contentTarget
  }

  function consoleNewElement(contentTarget, element) {
    // If the new element has the newline class, add a new line
    if(element.is(".newline")) {
      contentTarget = consoleNewline(contentTarget);
    }
    // Empty out text
    element.text("");
    // Add this element after old target
    contentTarget.after(element);

    return element;
  }

  function renderConsole(contentTarget, contentArray, textArray, delay) {
    // If the content array is empty and there's no more target text, exit
    if(contentArray.length == 0 && textArray.length == 0) {
      // Make sure cursor is fixed before exiting
      $("#cursor").addClass("blink");
      return
    }
    // If textArray is empty, we need a new element
    if(textArray.length == 0) {
      // Pull element out of the content array
      newElement = $(contentArray.shift());

      // Pull out text and delay
      delay = newElement.data("delay");
      if(delay === undefined) {
        delay = typingSpeed;
      }

      if(newElement.is(".typewriter")) {
        textArray = newElement.text().split("");
      }
      else {
        // This is "" sometimes; that's ok.
        textArray = [newElement.text()];
      }
      // Make new element
      contentTarget = consoleNewElement(contentTarget, newElement);
    }

    // If the delay is less than 750ms, disable the cursor blink
    if(delay < 750) {
      $("#cursor").removeClass("blink");
    }
    else {
      $("#cursor").addClass("blink");
    }

    // Add an element of textArray to the contentTarget
    contentTarget.append(textArray.shift());
    // If the consoleDisabled let is set to true (by the disable button for example),
    // just render everything with out the delay
    if(consoleDisabled) {
      renderConsole(contentTarget, contentArray, textArray, 0);
    }
    currentAnimation = setTriggerTimeout(
      renderConsole, delay,  // timeout args
      contentTarget, contentArray, textArray, delay, // function args
    );
  }

  // Render the pseudoconsole
  if ($('#template-content').length) {
    let contentArray = $("#template-content").children().toArray();
    renderConsole(null, contentArray, [], typingSpeed); 
  }
});