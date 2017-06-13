// import React from 'react'
var enums = require('../enums')

export default class CodeOutputQuestion extends React.Component 
{
	constructor(props)
    {
		super(props);
        this.checkUserInput = this.checkUserInput.bind(this); // bind "this" context
        this.userInputCb = this.userInputCb.bind(this); 
        this.getCheckAnswerButton = this.getCheckAnswerButton.bind(this);
        this.userInputsShouldRender= this.userInputsShouldRender.bind(this);
        this.state = {
            correctOutputLines : 0,
            enteredAnswer : '',
        }
	}
    
	render()
    {              
		return (
			<div style={{width : '100%', textAlign: 'left'}} >
                <pre className="prettyprint linenums" style={{border:'none'}}>
                    {this.props.question.code}
                </pre>
                <pre>
                    {this.getOutputLines()}
                    {this.getInputBox()}
                </pre>
                {this.getCheckAnswerButton()}
			</div>
		);
	}    
    
    checkUserInput()
    {
        var output = this.props.question.output || [];
        this.props.checkInputCb(output.concat([this.state.enteredAnswer]));
    }
    
    userInputCb(e)
    {
        this.setState({ enteredAnswer : e.target.value })
    }
    
    userInputsShouldRender()
    {
        return true;
    //  return (this.state.correctOutputLines < this.props.question.output.length)
    }
    
    getCheckAnswerButton()
    {
        var text = (this.props.response && this.props.response.correct ? enums.messages.correctlyAnswered : 'CHECK');
        if (!this.userInputsShouldRender())
            return null;
        return (
            <button
                className="btn btn-success"
                style={{width:'100%'}}
                disabled = {this.props.response && this.props.response.correct}
                onClick={this.checkUserInput}>
                {text}
            </button>);
    }
    
    getInputBox()
    {
         if (!this.userInputsShouldRender())
            return null;  
        
        return (
            <input 
                value = {this.state.enteredAnswer}
                onChange = {this.userInputCb}
                placeholder = "Enter the next line of output"
                type = "text"
                style = {
                    {
                        width : '100%',
                        border : 'none',
                        padding : '5px',
                        background : 'none'
                    }
                }
            />);
    }
    
    getOutputLines()
    {
        if (!this.props.question.output)
            return null;
        return this.props.question.output.map(line => <span>{line}<br/></span>);
    }
}