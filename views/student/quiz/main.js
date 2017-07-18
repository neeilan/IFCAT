import QuizApp from './components/QuizApp.jsx';
import CodeOutputQuestion from './components/CodeOutputQuestion.jsx'

import React from 'react'
import ReactDOM from 'react-dom';
import enums from './enums'



const currGroupId = 'g4';

// mock data
var testQuestion = {
	id: 1,
	question: 'What is your favorite color?',
	choices: ['Blue', 'Green', 'Red'],
	type: enums.questionTypes.multipleChoice,
	number: 2,
	attachments: []
};
var testQuestion2 = {
	id: 2,
	question: 'What are your favorite foods?',
	choices: ['Pizza', 'Pie', 'Other'],
	type: enums.questionTypes.multiSelect,
	number: 3,
	attachments: []
}

var testQuestion3 = {
	id: 3,
	question: 'Enter your favorite prime number',
	type: enums.questionTypes.shortAnswer,
	number: 4,
	attachments: []
}


var testQuestion4 = {
	id: 4,
	question: 'Pick all the true statements',
	choices: ['true != false', 'null === false', 'null == false', 'undefined === false'],
	type: enums.questionTypes.multiSelect,
	number: '4b',
	attachments: []
}
		
const _quizData = {
	groupId : currGroupId,
	userId : 'a5',
	groupName : '4',
	allocateMembers: enums.allocateMembers.automatically,
	active: true,
	quiz : {
		questions : [testQuestion2, testQuestion, testQuestion3, testQuestion4]
	}
}
// mock socket io object
const mock_io = () => ({
	handlers : {},
	on: function(event, handler){
		this.handlers[event] = handler;
	},
  emit: function(event, data) {

		console.log('EMIT: ' + event);
		console.log(data);
		
		switch (event) {
			case 'requestQuiz' : {
				this._emit('quizData', _quizData);
				break;
			}
			case 'GROUP_ATTEMPT' : {
				console.log(data);
				break;
			}
			case 'assignSelfAsDriver' : {
				this._emit('resetDriver', { groupId: currGroupId });
				this._emit('ASSIGNED_AS_DRIVER', { groupId: currGroupId });
			}
		}
	},
	_emit: function(event, data){
		if (event in this.handlers) {
			this.handlers[event](data);
		}
	}
});

var question = {
    type : 'code-output',
    question : 'Complete all line(s) of output',
    code : 'def greet(name):\n\tprint ("Hello " + name) # comment\n\ngreet("Jack")\ngreet("Jill")\ngreet("Bob")\n\ndef zero():\n\treturn 0',
    output : [
        'Hello Jack',
        'Hello Jill',
        'Hello Bob'
    ]
}


ReactDOM.render(<QuizApp io={io}/>, document.getElementById('quizAppDiv'));
// ReactDOM.render(<CodeOutputQuestion question={question}/>, document.getElementById('hello2'));