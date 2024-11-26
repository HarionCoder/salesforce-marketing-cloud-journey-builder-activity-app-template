define(["postmonger"], function (Postmonger) {
    "use strict";
  
    var connection = new Postmonger.Session();
    var payload = {};
    var lastStepEnabled = false;
    var steps = [
      // initialize to the same value as what's set in config.json for consistency
      { label: "Step 1", key: "step1" },
      { label: "Step 2", key: "step2" },
      { label: "Step 3", key: "step3" },
      { label: "Step 4", key: "step4", active: false },
    ];
    var currentStep = steps[0].key;
  
    //Startup Sequence
    $(window).ready(onRender);
  
    connection.on("initActivity", initialize);
    connection.on("requestedTokens", onGetTokens);
    connection.on("requestedEndpoints", onGetEndpoints);
  
    connection.on("clickedNext", onClickedNext);
    connection.on("clickedBack", onClickedBack);
    connection.on("gotoStep", onGotoStep);
  
    function onRender() {
      // JB will respond the first time 'ready' is called with 'initActivity'
      connection.trigger("ready");
  
      connection.trigger("requestTokens");
      connection.trigger("requestEndpoints");
  
      var message = getMessage();
      $("#message").html(message);
    }
  
    function initialize(data) {
      // document.getElementById("configuration").value = JSON.stringify(
      //   data,
      //   null,
      //   2
      // );
  
      console.log("-------- triggered:onInitActivity({obj}) --------");
      if (data) {
        payload = data;
      }
  
      let message = '';
      let hasInArguments = Boolean(
        payload["arguments"] &&
        payload["arguments"].execute &&
        payload["arguments"].execute.inArguments &&
        payload["arguments"].execute.inArguments.length > 0
      );
  
      let inArguments = hasInArguments
        ? payload["arguments"].execute.inArguments
        : {};
  
      $.each(inArguments, function (index, inArgument) {
        $.each(inArgument, function (key, val) {
          if (key === "message") {
            // message = val;
          }
        });
      });
  
      // If there is no message selected, disable the next button
      if (!message) {
        showStep(null, 1);
        connection.trigger("updateButton", { button: "next", enabled: true });
        //connection.trigger("updateButton", { button: "next", enabled: false });
        // If there is a message, skip to the summary step
      } else {
        $("#msg-txt").val(message);
        $("#message").html(message);
        //showStep(null, 3);
      }
    }
  
    function onGetTokens(tokens) {
      // Response: tokens = { token: <legacy token>, fuel2token: <fuel api token> }
      // console.log(tokens);
    }
  
    function onGetEndpoints(endpoints) {
      // Response: endpoints = { restHost: <url> } i.e. "rest.s1.qa1.exacttarget.com"
      // console.log(endpoints);
    }
  
    //Save Sequence
    function onClickedNext() {
      // var configuration = JSON.parse(
      //   document.getElementById("configuration").value
      // );
      //var configuration = document.getElementById("configuration").value;
  
      //connection.trigger("updateActivity", configuration);
      //save(configuration);
  
      if (
        (currentStep.key === "step3" && steps[3].active === false) ||
        currentStep.key === "step4"
      ) {
        save();
      } else {
        connection.trigger("nextStep");
      }
    }
  
    function onClickedBack() {
      connection.trigger("prevStep");
    }
  
    function onGotoStep(step) {
      showStep(step);
      connection.trigger("ready");
    }
  
    function showStep(step, stepIndex) {
      if (stepIndex && !step) {
        step = steps[stepIndex - 1];
      }
  
      currentStep = step;
  
      $(".step").hide();
  
      switch (currentStep.key) {
        case "step1":
          $("#step1").show();
          connection.trigger("updateButton", {
            button: "next",
            enabled: true, //Boolean(getMessage()),
          });
          connection.trigger("updateButton", {
            button: "back",
            visible: false,
          });
          break;
        case "step2":
          $("#step2").show();
          connection.trigger("updateButton", {
            button: "back",
            visible: true,
          });
          connection.trigger("updateButton", {
            button: "next",
            text: "next",
            visible: true,
          });
          break;
        case "step3":
          $("#step3").show();
          connection.trigger("updateButton", {
            button: "back",
            visible: true,
          });
          if (lastStepEnabled) {
            connection.trigger("updateButton", {
              button: "next",
              text: "next",
              visible: true,
            });
          } else {
            connection.trigger("updateButton", {
              button: "next",
              text: "done",
              visible: true,
            });
          }
          break;
        case "step4":
          $("#step4").show();
          break;
      }
    }
  
    function save() {
        const value = getMessage();

        // 'payload' is initialized on 'initActivity' above.
        // Journey Builder sends an initial payload with defaults
        // set by this activity's config.json file.  Any property
        // may be overridden as desired.
        payload.name = value; //text message to send to telegram
    
        payload["arguments"].execute.inArguments = [{ message: value }];
        //payload["arguments"].execute.inArguments.push({"text": value})
    
        payload["arguments"].execute.inArguments = [
          {
            'chat_id': "@vcbsalesforce"
          },
          {
            'emailAddress': '{{InteractionDefaults.Email}}'
          },
          {
            'customMessage': value
          }
        ];
    
        //payload["arguments"].execute.inArguments = [{ "chat_id": "@vcbsalesforce", "text": value }];
    
        payload["metaData"].isConfigured = true;
 
      //console.log("LOG AGAIN" + payload);
      let inArguments = payload.arguments.execute.inArguments;
  
      // get the option that the user selected and save it to
      console.log("------------ triggering:updateActivity({obj}) ----------------");
      console.log("Sending message back to updateActivity");
      console.log("saving\n", value);
  
      connection.trigger("updateActivity", payload);
  
      console.log(inArguments.length);
      console.log(inArguments[0]['chat_id']);
      console.log(inArguments[1]['emailAddress']);
      console.log(inArguments[2]['customMessage']);
      //console.log(value);
    }
  
    function getMessage() {
      return $("#msg-txt").val();
    }
  
    $("#submit-this").click(function (e) {
      console.log("test this");
      save();
    });
  });
  