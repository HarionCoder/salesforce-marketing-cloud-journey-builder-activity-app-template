define(["postmonger"], function(Postmonger) {
    "use strict";

    let connection = new Postmonger.Session();
    let payload = {};
    let lastStepEnabled = false;
    let steps = [
        // initialize to the same value as what's set in config.json for consistency
        { label: "Soạn Thảo Nội Dung Tin Nhắn", key: "step1" },
        { label: "Cấu Hình Đối Tượng Nhận Tin", key: "step2" },
        { label: "Duyệt Tin Nhắn Và Gửi Đi Telegram", key: "step3", active: false }
    ];
    let currentStep = steps[0].key;

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

        const content = getContent();
        $("#msg-frm .message__text").html(content.message);
        $("#prv-img").setAttr('src', content.photo);
    }

    function initialize(data) {

        console.log("~~~ Trigger: Start Activity ------------------------------------------");

        if (data) {
            payload = data;
        }

        console.log("*** View: Payload Data ------------------------------------------");
        console.log(payload);
        console.log("### End: Payload Data ------------------------------------------");

        let parameters = '';
        let hasInArguments = Boolean(
            payload["arguments"] &&
            payload["arguments"].execute &&
            payload["arguments"].execute.inArguments &&
            payload["arguments"].execute.inArguments.length > 0
        );

        console.log("~~~ Assign: InArgument Data ------------------------------------------");
        let inArguments = hasInArguments ? payload["arguments"].execute.inArguments : {};

        console.log("*** View: inArguments Data ------------------------------------------");
        console.log(payload);
        console.log("### End: inArguments Data ------------------------------------------");

        $.each(inArguments, function(index, inArgument) {
            $.each(inArgument, function(key, val) {
                if (key === "parameter") {
                    parameters = val;
                }
            });
        });

        // If there is no message selected, disable the next button
        if (!parameters) {
            showStep(null, 1);
            connection.trigger("updateButton", { button: "next", enabled: true });
            // If there is a message, skip to the summary step
        } else {
            // $("#msg-txt").val(message);
            // $("#message").html(message);
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

        if ((currentStep.key === "step2" && steps[2].active === false) || currentStep.key === "step3") {
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
                    enabled: true, //Boolean(getContent()),
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
            case "step3":
                $("#step3").show();
                break;
        }
    }

    function save() {
        const content = getContent();
        const message = content.message;
        const photo = content.photo;

        // 'payload' is initialized on 'initActivity' above.
        // Journey Builder sends an initial payload with defaults
        // set by this activity's config.json file.  Any property
        // may be overridden as desired.
        payload.name = message; //text message to send to telegram
        payload["arguments"].execute.inArguments = [{ parameter: content }];
        //payload["arguments"].execute.inArguments.push({"text": value})

        payload["arguments"].execute.inArguments = [{
                'telegramId': "@VCB_poc"
            },
            {
                'emailAddress': '{{InteractionDefaults.Email}}'
            },
            {
                'telegramId': '{{InteractionDefaults.Email}}'
            },
            {
                'telegramMessage': message
            },
            {
                'imageURL': photo
            }
        ];

        //payload["arguments"].execute.inArguments = [{ "chat_id": "@vcbsalesforce", "text": value }];

        payload["metaData"].isConfigured = true;

        //Check stored configuration
        let inArguments = payload.arguments.execute.inArguments;

        // get the option that the user selected and save it to
        console.log("*** View: Final inArguments ------------------------------------------");
        console.log(inArguments);
        console.log("### End: Final inArguments ------------------------------------------");

        connection.trigger("updateActivity", payload);

    }

    function getContent() {
        return {
            message: $("#msg-txt").val(),
            photo: $("#img-url").val()
        }
    }

    $("#send-request").click(function(e) {
        console.log("Message sent...");
        save();
    });
});