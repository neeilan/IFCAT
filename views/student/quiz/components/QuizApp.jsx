import CodeOutputQuestion   from './CodeOutputQuestion.jsx'
import Question             from './Question.jsx'
import PreQuiz              from './PreQuiz.jsx'
import PostQuiz             from './PostQuiz.jsx'
import GroupBuilder         from './GroupBuilder.jsx'
import GroupSelect          from './GroupSelect.jsx'
import ScoreBar             from './ScoreBar.jsx'
import StarScore            from './StarScore.jsx'
import EmptyLine            from './EmptyLine.jsx'

import enums from '../enums'

import React from 'react'

export default class QuizApp extends React.Component {
	constructor(props) {
		super(props);

		this.setDriverCb = this.setDriverCb.bind(this);
		this.awardPointCb = this.awardPointCb.bind(this);
		this.submitChoiceCb = this.submitChoiceCb.bind(this);
		this.selectQuestionCb = this.selectQuestionCb.bind(this);
		this.createGroupCb = this.createGroupCb.bind(this);

		this.state = {
			score: 0,
			quiz: null,
			groupId: null,
			groupName : null,
			userId : null,
			isDriver: false,
			hasCreatedGroup: false,
			selectedQuestion: null,
			active: true,
			complete: false,
			inProgress: false
			
		}
	}

	componentWillMount() {
		var url = window.location.href;
		var quizId = url.slice(url.indexOf('/quizzes/') + 9, url.indexOf('/start'));
		var socket = this.props.io();	
		this.socket = socket;
		

		
		socket.on('setGroup', (id) => {
			console.log('setGroup');
			window.location.href = window.location.href;
		})	
		
		socket.on('groupsUpdated', (data) => {
			console.log('groupsUpdated');
				// renderGroups(data.groups);
		})
		
		socket.on('quizData', (tutorialQuiz) => {
			console.log(tutorialQuiz);
			this.setState({
				quiz : tutorialQuiz.quiz,
				groupId : tutorialQuiz.groupId || this.state.groupId,
				userId : tutorialQuiz.userId || this.state.userId,
				groupName : tutorialQuiz.groupName,
				active: tutorialQuiz.active
			});
		})
		
		
		socket.on('resetDriver', (data) => {
			  console.log('resetDriver');
				if (this.state.groupId != data.groupId) return;
				this.setState({isDriver : false, inProgress: true});
		})		
		
		socket.on('info', (data) => {
				swal('', data.message, 'info');
		})		
		
		socket.on('postQuiz', (data) => {
			  console.log('postQuiz');
				if (!this.state.groupId || data.groupId != this.state.groupId) return;
		})
		
		socket.on('assignedAsDriver', (data) => {
			console.log('assignedAsDriver');
			
				if (!this.state.groupId || data.groupId != this.state.groupId) return;
				// enable choices and submit buttons (disabled by default)
			this.setState({isDriver : true, inProgress: true});
				
		})	
		
		socket.emit('requestQuiz', quizId);
		
	}

	getCurrentQuestion() {
		if (this.state.selectedQuestion === null) {
			if (this.state.quiz && this.state.quiz.questions.length > 0) {
				this.setState({ selectedQuestion : this.state.quiz.questions[0] });
                let selectedQuestion = this.state.quiz.questions[0];
                return (
                    <Question
                        previouslyAnswered={false}
                        isDriver={this.state.isDriver}
                        question = {selectedQuestion.question} 
                        questionType={selectedQuestion.type} 
                        choices = {selectedQuestion.choices} 
                        attachments = {selectedQuestion.attachments}
                        submitCb = {this.submitChoiceCb}
                        />
                    );                
			} else {
				return null;
			}
		}
		console.log(this.state.selectedQuestion);
		return (
			<Question
				previouslyAnswered={false}
				isDriver={true}
				question = {this.state.selectedQuestion.question} 
				questionType={this.state.selectedQuestion.type} 
				choices = {this.state.selectedQuestion.choices} 
				attachments = {this.state.selectedQuestion.attachments}
				submitCb = {this.submitChoiceCb}
				/>
			);
	}
	
	getScoreBar() {
		return (<ScoreBar
							questions={this.state.quiz.questions} 
							selectQuestionCb={this.selectQuestionCb} 
							selectedQuestion={this.state.selectedQuestion}/>)
	}
	
	getPostQuiz() {
		if (!this.state.complete) {return null;}
		return (
						<PostQuiz 
							finalScore = { 10 }
							teammates = { [ {name : 'Kobe', id : 'KB24'} ] } 
							awardPointCb = { this.awardPointCb } />
		);
	}
	
	getGroupBuilder(){
		if (this.state.quiz.allocateMembers !== enums.allocateMembers.selfSelect) {
			return null;
		}
		return (
			<GroupBuilder
				groups = { [{ name : 'G1'}, { name : 'G2'}] }
				createGroupCb = { this.createGroupCb }
				/>
			);
	}
	
	render() {
		
		var scoreIndicator = this.state.inProgress ? <span>Score : {this.state.score}</span> : null;
		var starScore = this.state.inProgress ?  <StarScore full={3} empty={5} /> : null;
		var preQuiz = this.state.inProgress ? null : <PreQuiz setDriverCb = { this.setDriverCb } />;
		var scoreBar = this.state.inProgress ? this.getScoreBar() : null;
		var question = this.state.inProgress ? this.getCurrentQuestion() : null;
		var postQuiz = this.state.inProgress ? null : this.getPostQuiz();
		var groupBuilder = this.state.inProgress ? null : this.getGroupBuilder();
		
		return (
			<div>
						{ scoreIndicator }
						{ starScore }
					    { preQuiz }
						{ groupBuilder }
						{ scoreBar }
						{ question }
						{ postQuiz }



        </div>
		)
	}

	setDriverCb(selfIsDriver) {
		if (selfIsDriver) {
			this.socket.emit('assignSelfAsDriver');
		} else {
			this.setState({inProgress: true, isDriver: false});
		}
	}
	
	createGroupCb() {
		console.log('creating group');	
	}
	
	awardPointCb(id) {
		alert('Awarded point to ' + id);
	}
	submitChoiceCb(choices) {
		this.socket.emit('groupAttempt', choices);
	}
	selectQuestionCb(question) {
		this.setState({
			selectedQuestion: question
		});
	}
}