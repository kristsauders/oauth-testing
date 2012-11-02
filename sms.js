var rest = require('restler');

//This is a function to check for received SMS messages, it should always return successful reponse as long as the access token is valid
function getSms(AT, j) {
    rest.get('https://api.att.com/rest/sms/2/messaging/inbox?RegistrationID=80712029&access_token=' + AT).on('complete', function(data, response) {
		//Print the response and then chech again by running this same function again in an infinite loop
		if (response.statusCode == 200) {
			console.log(new Date() + ' Get SMS successful with access token ' + AT + ' in thread ' + j);
			setTimeout(function() {
				getSms(AT, j);
			}, 5000);
		}
		else {
			console.log(new Date() + ' Cannot get received SMS messages with access token' + AT + ' in thread ' + j);
            console.log(new Date() + ' error was ' + data.requestError.policyException.text);
            setTimeout(function() {
    			getSms(AT, j);
			}, 5000);
		}
	});
}

function startProcess(i) {
    var j = i;
    setTimeout(function() {
        console.log(new Date() + ' Starting thread ' + j);
		//First get an access token using these credentials
		rest.post('https://api.att.com/oauth/token', {
			data: {
				"client_id": "200e0cfbdea5400581b7318c05c2dd14",
				"client_secret": "97b38805c68dda36",
				"grant_type": "client_credentials",
				"scope": "SMS"
			}
		}).on('complete', function(data, response) {
			//Print the access token response and then send an SMS message to our pink test phone
			if (response.statusCode == 200) {
				var AT = data.access_token;
				console.log(new Date() + ' Got access token ' + AT + ' in thread ' + j);
				rest.post('https://api.att.com/rest/sms/2/messaging/outbox?access_token=' + AT, {
					data: {
						"Message": "hello world",
						"Address": "tel:4258028620"
					}
				}).on('complete', function(data, resopnse) {
					if (response.statusCode == 200) {
						//Print the response and then check for received SMS messages using the function at the top
						console.log(new Date() + ' Sent SMS message with access token ' + AT + ' in thread ' + j);
						getSms(AT, j);
					}
					else {
						console.log(new Date() + ' Cannot send SMS with access token ' + AT + ' in thread ' + j);
                        getSms(AT, j);
					}
				});
			}
			else {
				console.log(new Date() + ' Cannot get access token in thread ' + j);
			}
		});
	}, 1000 * i);
}

//Run 10 instances of this whole process
for (var i = 1; i < 21; i++) {
	//Start each thread
    startProcess(i);
}