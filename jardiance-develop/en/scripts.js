$(function() {

	var riskFactors = JSON.parse(sessionStorage.getItem("riskFactors")) || [];
	var totalScore = JSON.parse(sessionStorage.getItem("totalScore")) || [];
	var currentQuestion = '';
	var htmlContents = '';
	var q2values = [];
	var q3values = [];
	var container = $('.chat-pal');
    var timer;

	//Check if user has already been to the site
	if (sessionStorage.getItem("currentQuestion") === null) {
		//Set up sessionStorage variables
		sessionStorage.setItem("currentQuestion", currentQuestion);
	} else {
		//trigger welcome msg
		welcomeBackMsg();
	}

	
    window.onload = resetTimer;
    // DOM Events all reset the idle timer
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;
    document.onclick = resetTimer;

    function resetTimer() {
        clearTimeout(timer);
        timer = setTimeout(idleMessage, 120000)
    }

    function idleMessage() {
    	//If they have answered the Name question
    	if(currentQuestion.length && $('.cf-idle').length == 0) {
    		var idleCopy = '';
	    	if(currentQuestion < 15){
	    		idleCopy = '<p>Just a few more questions! Keep going to find out your personal assessment.</p>';
	    	} else {
	    		idleCopy = '<p>You’re nearly finished! Keep going and we will provide you with results of your personal assessment</p>';
	    	}
	    	var idleHtml = '<div class="cf-question hide cf-idle">';
			idleHtml += '<div class="heart-container"><div class="heart"></div><img src="heart-icon.svg" alt=""></div>';
			idleHtml += '<div class="text-container">';
			idleHtml += idleCopy;
			idleHtml += '<p>Would you like to continue the heart disease Risk Assessment Tool or restart from the beginning?</p></div>';
			idleHtml += '<div class="buttons">';
			idleHtml += '<button class="idle" id="idle-1" value="no" score="1"><label for="idle-1">No, I’d like to continue where I left off </label></button>';
			idleHtml += '<button class="idle" id="idle-2" value="yes" score="1"><label for="idle-1">Yes, I’d like to start over </label></button>';
			idleHtml += '</div>';
			idleHtml += '</div>';

			//Insert idleHtml after current question
			currentQuestion = parseInt(currentQuestion) + 1;
			$('.cf-question[number="' + currentQuestion + '"]').next().after(idleHtml);
			var a = $('.cf-question[number="' + currentQuestion + '"]').find('.buttons');
			displayNextQuestion(a, false);
			//Disable current buttons
			$('.cf-question[number="' + currentQuestion + '"] button').attr('disabled', true);

        	//If user wants to continue, fade this question away. 
        	$('.idle[value="no"]').on('click', function(){
        		$(this).parents('.cf-idle').fadeOut(500, function(){
        			//Remove cf-idle from DOM
        			$('.cf-idle').remove();
        			//Re-enable buttons
        			$('.cf-question[number="' + currentQuestion + '"] button').attr('disabled', false);
        		});
        	});
        	//If they want to start again, refresh iframe.
        	$('.idle[value="yes"]').on('click', function(){
        		emptyLocal();
        		location.reload();
        	});
        } else {
        	//do nothing
        }
    }

    function welcomeBackMsg() {
    	var localcurrentQuestion = sessionStorage.getItem("currentQuestion");

    	if(parseInt(localcurrentQuestion) > 0){
    		//Remove the pulse class so hearts don't animate on re-load
    		var htmlContent = JSON.parse(sessionStorage.getItem("htmlContent"));
    		htmlContent = htmlContent.replace(/ pulse/g, ' done');
    		$('.chat-pal').html(htmlContent);

    		awayMessage();
    	}
    }

    function awayMessage() {
    	var localcurrentQuestion = sessionStorage.getItem("currentQuestion");
    	//If they have answered the Name question
    	if(localcurrentQuestion.length && $('.cf-away').length == 0) {
    		var idleCopy = '';
	    	var idleHtml = '<div class="cf-question hide cf-away">';
			idleHtml += '<div class="heart-container"><div class="heart"></div><img src="heart-icon.svg" alt=""></div>';
			idleHtml += '<div class="text-container"><p>Hello again!</p><p>Welcome back!</p>';
			idleHtml += '<p>Would you like to continue the heart disease Risk Assessment Tool or restart from the beginning?</p></div>';
			idleHtml += '<div class="buttons">';
			idleHtml += '<button class="idle" id="idle-1" value="no" score="1"><label for="idle-1">No, I’d like to continue where I left off </label></button>';
			idleHtml += '<button class="idle" id="idle-2" value="yes" score="1"><label for="idle-1">Yes, I’d like to start over </label></button>';
			idleHtml += '</div>';
			idleHtml += '</div>';

			//Insert idleHtml after current question
			localcurrentQuestion = parseInt(localcurrentQuestion) + 1;
			//Condition for AssessRisk
			var a = '';
			if(localcurrentQuestion == 19){
				localcurrentQuestion2 = 18;
				$('.cf-question[number="' + localcurrentQuestion2 + '"]').next().next().after(idleHtml);
				a = $('#cf-answer10 .text-container');
			} else {
				$('.cf-question[number="' + localcurrentQuestion + '"]').next().after(idleHtml);
				a = $('.cf-question[number="' + localcurrentQuestion + '"]').find('.buttons');
			}
			displayNextQuestion(a, false);
			//Disable current buttons
			$('.cf-question[number="' + localcurrentQuestion + '"] button').attr('disabled', true);

        	//If user wants to continue, fade this question away. 
        	$('.idle[value="no"]').on('click', function(){
        		$(this).parents('.cf-away').fadeOut(500, function(){
        			//Remove cf-away from DOM
        			$('.cf-away').remove();
        			//If this is a question, re-enable buttons, If it is AssessRisk, re-assess risk
        			if(localcurrentQuestion == 19){
        				assessRisk();	
        			} else {
        				$('.cf-question[number="' + localcurrentQuestion + '"] button').attr('disabled', false);
        			}
        		});
        	});
        	//If they want to start again, refresh iframe.
        	$('.idle[value="yes"]').on('click', function(){
        		emptyLocal();
        		location.reload();
        	});
        } else {
        	//do nothing
        }
    }

    function emptyLocal() {
    	//reset all local storage items
    	sessionStorage.removeItem("currentQuestion");
    	sessionStorage.removeItem('htmlContent');
    	sessionStorage.removeItem('totalScore');
    	sessionStorage.removeItem('riskFactors');
    }

	//Special click handler for intro only
	$('#intro').on('click', function(){
		$(this).attr('disabled', true);

		$(this).fadeOut(500, function(){
			$(this).siblings('.text-container').css('margin-bottom', '5rem');
			displayNextQuestion(this, false);
		});
	});

	//Click handler for question with name input
	$('#cf-question0 button').on('click', function(){
		var name = $('#cf-name').val();
		//Add name to all other questions
		if((typeof(name) == 'undefined') || (name.length == 0)){
			$('.yes-name').hide();
		} else {
			$('.name').text(name);
			$('.no-name').hide();
		}
	});

	//Click handler for all generic questions
	$('.questionAll').on('click', function(){
		//disable the current set of buttons 
		$(this).attr('disabled', true);
		$(this).addClass('selected').siblings().attr('disabled', true).addClass('not-selected');
		//Add class to input for first question only
		if($(this).prev().is('input')){
			var name = $(this).prev().val();
			var label = $("label[for='"+$(this).attr("id")+"']");
			label.text(name);
		}
		getAnswer(this);
		getRiskFactors(this);
	});

	//Click handler for all multi-part questions
	$('.multipart').on('click', function(){
		//disable the current set of buttons 
		$(this).attr('disabled', true);
		$(this).addClass('selected').siblings().attr('disabled', true).addClass('not-selected');
		getMultiAnswer(this);
		getRiskFactors(this);
	});


	//Generic function to handle getting the value of a GENERIC response, displaying the answer, and displaying the next question
	function getAnswer(a){
		//Gather data attributes from the current question and answer
		var questionnum = $(a).parents('.cf-question').attr('number');
		var answerval = $(a).val();
		var response = $(a).attr('answer');
		var score = $(a).attr('score');
		var name = $('#cf-name').val();
		//Split string into array based on &&
		response = response.replace(/&&/g, '</p><p>');
		response = response.replace(/&name&/g, name);
		//Add score to totalscore array (check first, as there is no score for question 0)
		if(typeof(score) != 'undefined'){
			//Check to ensure this score has not already been added to array before of a page refresh
			if(totalScore.length == parseInt(questionnum) - 1){
				totalScore.push(parseInt(score));
				sessionStorage.setItem("totalScore", JSON.stringify(totalScore));
			}
		} 
		//Update currentQuestion val and sessionStorage variables
		currentQuestion = questionnum;
		sessionStorage.setItem("currentQuestion", currentQuestion);
		//Put the answer in the DOM
		$(a).parents('.cf-question').next().children('.text-container').html('<p class="response">' + response + '</p>');

		displayNextAnswer(a);
	};

	function displayNextAnswer(a) {
		var answer = [];
		var timeToRead = 0; 
		var duration = 2600;

		//Push response to array so we can iterate through and display one at a time
		$(a).parents('.cf-question').next().find('p').each(function () {
            answer.push($(this));
        });

		setTimeout(function(){
       		$(a).parents('.cf-question').next().removeClass('hide').find('.heart-container').addClass('pulse');
       		scrollBottom();
        }, 500);

        setTimeout(function(){
       		$(a).parents('.cf-question').next().find('.text-container').addClass('show');
       		scrollBottom();
        }, duration);

        var count = 0;
		for(var j=0; j<answer.length; j++) {

			if(j != 0){
    			duration = ( wordCount(answer[j-1]) / (360/60) * 1000); 
    		}

			timeToRead += duration;
			$(answer[j]).delay(timeToRead).fadeIn(500, function() {
				count++;
				resetTimer();
				scrollBottom();
				
				if(count == answer.length) {
					if($(a).hasClass('last')) {
						var timeout = ( wordCount(answer[count-1]) / (360/60) * 1000);
						setTimeout(function() {
							displayNextQuestion(a, true);
						}, timeout);
					}
					else {
						var timeout = ( wordCount(answer[count-1]) / (360/60) * 1000);
						setTimeout(function() {
							displayNextQuestion(a, false);
						}, timeout);
					}
				}
			});
		}
	}

	function displayNextQuestion(a, last) {
		var question = [];
		var timeToRead = 0; 
		var duration = 2600;

		//Push question to array so we can iterate through and display one at a time
		$(a).parents('.cf-question').next().next().find('p').each(function () {
            question.push($(this));
        });

		// animate the next heart beat
		setTimeout(function(){
			$(a).parents('.cf-question').next().next().removeClass('hide').find('.heart-container').addClass('pulse');
			scrollBottom();
        }, 500);
		
		setTimeout(function(){
			$(a).parents('.cf-question').next().next().find('.text-container').addClass('show');
			scrollBottom();
		}, duration);

		//reveal the next question
		var count = 0;
		for(var j=0; j<question.length; j++) {
    		if(j!=0) {
    			duration = (wordCount(question[j-1]) / (360/60) * 1000); 
    		}

			timeToRead += duration;
			$(question[j]).delay(timeToRead).fadeIn(500, function() {
				count++;
				resetTimer();
				scrollBottom();

				if(count == question.length) {
					$(a).parents('.cf-question').next().next().find('.buttons').fadeIn({queue: false, duration: 500}).animate({top: "0" }, 500);
					//If this is NOT the away or idle msg, add the new DOM elements to sessionStorage
					if($(a).parents('.cf-question').next().next().hasClass('cf-idle') || $(a).parents('.cf-question').next().next().hasClass('cf-away')){
						//do not update sessionStorage
					} else {
						console.log('updated htmlContents');
						htmlContents = $('.chat-pal').html();
	    				sessionStorage.setItem('htmlContent', JSON.stringify(htmlContents));
					}
					scrollBottom();

					if(last){
						sessionStorage.setItem('htmlContent', JSON.stringify(htmlContents));
						assessRisk();
					}
				}
			});
		}
	}

	function wordCount(sentence) {
		var numWords = sentence.text().split(" ");
		if(numWords.length >= 10){
			return numWords.length;
		} else {
			return 10;
		}
		
	}

	//Generic function to handle getting the value of a MULTI-PART response, displaying the answer, and displaying the next question
	function getMultiAnswer(b){
		//Create an array for displaying the content progressively
		var answer = [];
		//Gather data attributes from the current question and answer
		var questionnum = $(b).parents('.cf-question').attr('number');
		var answerval = $(b).val();
		var response = '';
		var score = $(b).attr('score');
		//Add score to totalscore array
		if(totalScore.length == parseInt(questionnum) - 1){
			totalScore.push(parseInt(score));
			sessionStorage.setItem("totalScore", JSON.stringify(totalScore));
		}
		//Update currentQuestion val and sessionStorage variables
		currentQuestion = questionnum;
		sessionStorage.setItem("currentQuestion", currentQuestion);
		//Push value to specific question value array
		if(questionnum >= 2 && questionnum <= 6){
			var currentArray = q2values;
		} else if(questionnum >= 7 && questionnum <= 11){
			var currentArray = q3values;
		}
		currentArray.push(answerval);
		//Evaluate the answers and display the most relevant answer
		if($(b).hasClass('final')){
			var containsyes = (currentArray.indexOf("yes") > -1);
			var containsmaybe = (currentArray.indexOf("maybe") > -1);
			if(containsyes){
				response = $(b).parent().find('[value="yes"]').attr('answer');
				response = response.replace(/&&/g, '</p><p>');
			} else if(containsmaybe) {
				response = $(b).parent().find('[value="maybe"]').attr('answer');
				response = response.replace(/&&/g, '</p><p>');
			} else {
				response = $(b).parent().find('[value="no"]').attr('answer');
				response = response.replace(/&&/g, '</p><p>');
			}
			//Put the response in the DOM
			$(b).parents('.cf-question').next().children('.text-container').html('<p>' + response + '</p>');
			//Dsiplay answer and next question
			displayNextAnswer(b);

		} else {
			//Display next question
			displayNextQuestion(b, false);
		}
	};

	//Retrieve the risk factor associated with user's choice and add it to an array
	function getRiskFactors(c){
		if(typeof($(c).attr('risk-factor')) != 'undefined'){
			//Check to see if risk factor is already in array. If not, add it.
			if(riskFactors.indexOf($(c).attr('risk-factor')) === -1) {
				riskFactors.push($(c).attr('risk-factor'));
			} else {
				//Do nothing, this item already exists
			} 
			sessionStorage.setItem("riskFactors", JSON.stringify(riskFactors));
		}
	};

	//Get the risk assessment results when the user clicks the last button
	function assessRisk(){

		var assessment = [];
		var timeToRead = 0; 
		var duration = 2600;
		//Add together the question scores to determine an outcome
		var total = 0;
		for (var i = 0; i < totalScore.length; i++) {
		    total += totalScore[i] << 0;
		}
		//If the total is 2 or more, the patient is at risk
		if(total >= 2){
			//Add the riskFactors array to the html
			riskFactors.forEach(function(factor){
				$('.risk-factors').append('<p>' + factor + '</p>');
			});
			$('.at-risk p').each(function () {
	            assessment.push($(this));
	        });
	        //Pulse the heart
	        setTimeout(function(){
				$('.at-risk').removeClass('hide').find('.heart-container').addClass('pulse');
				scrollBottom();
	        }, 500);
		} else {
			$('.not-at-risk p').each(function () {
           		assessment.push($(this));
            });
            //Pulse the heart
	        setTimeout(function(){
				$('.not-at-risk').removeClass('hide').find('.heart-container').addClass('pulse');
				scrollBottom();
	        }, 500);
		}

		setTimeout(function(){
			$('.cf-result .text-container').addClass('show');
			scrollBottom();
		}, duration);

		var count = 0;
		for(var j=0; j<assessment.length; j++) {

			if(j != 0){
    			duration = ( wordCount(assessment[j-1]) / (360/60) * 1000); 
    		}

			timeToRead += duration;
			$(assessment[j]).delay(timeToRead).fadeIn(500, function() {
				count++;
				scrollBottom();
				resetTimer();

				//Once the assessment is done, reset sessionStorage
				if(count == assessment.length) {
					emptyLocal();
				}
			});
		}
	};

	//Scroll the window down when more content is populated
	function scrollBottom() {
		var scrollTo = container[0].scrollHeight - container[0].scrollTop;
		$('html, body').animate({
		    scrollTop: scrollTo
		}, 800);
	};

    
});