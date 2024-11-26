define(["postmonger"], function(Postmonger) {
    "use strict";

    // let channel = '@VCB_poc';
    // let contact = '632717898';
    // const token = '8091993565:AAE_BFhW4GU3e1702RlwdUTycr_DL1gOhBo';
    // const endpoint = 'https://api.telegram.org/bot';
    // const url = `${endpoint}${token}/`;

    // let content = { 'message': '', 'photo': '' };

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
        $("#message").html('');
        $('#msg-txt').val('')
    }

    function initialize(data) {

        console.log('-------- Telegram Activity is triggered ({data}) --------');
        console.log(data)
        console.log('---------------------- End Log Data ----------------------');

        if (data) {
            payload = data;
        }

        let message;
        let hasInArguments = Boolean(
            payload["arguments"] &&
            payload["arguments"].execute &&
            payload["arguments"].execute.inArguments &&
            payload["arguments"].execute.inArguments.length > 0
        );

        let inArguments = hasInArguments ?
            payload["arguments"].execute.inArguments : {};

        console.log('-------- View inArguments --------');
        console.log(inArguments)
        console.log('------------- End View -------------');
        console.log(JSON.Stringify(inArguments));

        $.each(inArguments, function(index, inArgument) {
            $.each(inArgument, function(key, val) {
                if (key === "message") {
                    message = val;
                }
            });
        });

        console.log('-------- View message data --------');
        console.log(message)
        console.log('------------- End View -------------');

        // If there is no message selected, disable the next button
        if (!message) {
            showStep(null, 1);
            connection.trigger("updateButton", { button: "next", enabled: true });
            // If there is a message, skip to the summary step
        } else {
            $("#msg-txt").val(message);
            $("#message").html(message);
            showStep(null, 3);
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
        // var msg-txt = JSON.parse(
        //   $("#msg-txt").val()
        // );
        //var msg-txt = $("#msg-txt").val();

        //connection.trigger("updateActivity", msg-txt);
        //save(msg-txt);

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

    function call(content) {
        if (content.message !== '') {
            let met = content.method || 'GET';
            let api = `${url}${content.command}`;
            let dat = {
                'chat_id': channel,
                'text': content.message
            };

            if (content.photo !== '') {
                dat.photo = content.photo;
                dat.caption = content.message;
            }
            console.log(api, dat);
            $.ajax({
                url: api,
                data: dat,
                method: met,
                dataType: 'json',
                success: (res) => {
                    console.log(res);
                    alert('Your message has been sent to Telegram Channel!')
                }
            });
        }
    }

    function save() {

        var value = getMessage();

        // 'payload' is initialized on 'initActivity' above.
        // Journey Builder sends an initial payload with defaults
        // set by this activity's config.json file.  Any property
        // may be overridden as desired.
        payload.name = value; //text message to send to telegram

        payload["arguments"].execute.inArguments = [{ message: value }];
        //payload["arguments"].execute.inArguments = [{ "chat_id": "@vcbsalesforce", "text": value }];

        payload["metaData"].isConfigured = true;


        // get the option that the user selected and save it to
        console.log('------------ triggering:updateActivity({obj}) ----------------');
        console.log('Sending message back to updateActivity');
        console.log('saving\n', value);
        console.log('--------------------------------------------------------------');
        connection.trigger("updateActivity", payload);

    }

    function getMessage() {
        return $("#msg-txt").val();
    }

    $('#msg-txt').on('mouseout', function(event) {
        if ($('#msg-txt').val() == '') {
            $('#txt-cnt .message__text').html('');
            $('#txt-cnt .message__time').html('');
            $('#send-request').attr('disabled', 'disabled');
            if ($('#preview-frame').attr('class')!='hidden') {
                $('#preview-frame').slideUp("fast", function(){
                    $('#preview-frame').addClass('hidden');
                });
            }
        } else {
            const now = new Date(Date.now());
            let current_time = now.getHours() + ":" + now.getMinutes(); 
            console.log(current_time)
            $('#send-request').removeAttr('disabled');
            $('#txt-cnt .message__text').html($('#msg-txt').val());
            $('#txt-cnt .message__time').html(current_time);
            $('#preview-frame').slideDown("slow", function(){
                $('#preview-frame').removeClass('hidden');
            });
        }
    })

    $('#img-url').on('mouseout', function(event) {
        let iu = $('#img-url').val();
        if (iu != '') {
            $('#prv-img').attr('src', iu);
        }
    })

    $('#send-request').click(function(e) {
        let msg_txt = $('#msg-txt').val();
        if (msg_txt) {
            let data = {
                'message': msg_txt,
                'method': 'GET'
            };
            let img_url = $('#img-url').val() || '';
            let cmd = 'sendMessage';
            cmd = img_url != '' ? 'sendPhoto' : cmd;
            let body = `txt=${msg_txt}`;
            if (cmd == 'sendPhoto') {
                data.photo = img_url;
                data.method = 'POST';
                body = `photo_url=${img_url}&caption=${msg_txt}`;
            }
            data.command = cmd;
            // let api_url = `${url}${cmd}?chat_id=${channel}&${body}`;
            call(data);
        } 
    });

});