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

    componentDidMount() {
        this.runCodePrettify();
    }

    runCodePrettify() {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;

        script.src = 'https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
    }    
    
	render()
    {              
		return (
			<div style={{width : '100%', textAlign: 'left'}} >
                <pre className="prettyprint linenums" style={{border:'none'}}>
                    {this.props.question.code}
                </pre>
                {this.getOutputLines()}
                <pre>
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
        this.setState({ enteredAnswer : '' });
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
        var text = (this.props.response && this.props.response.correct) ? enums.messages.correctlyAnswered : !this.props.isDriver ? 'NOT DRIVER' : 'CHECK';
        if (!this.userInputsShouldRender())
            return null;
        return (
            <button
                className="btn btn-success"
                style={{width:'100%'}}
                disabled = {!this.props.isDriver || (this.props.response && this.props.response.correct)}
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
        if (!this.props.question.output || this.props.question.output.length === 0)
            return null;
        return (<pre> 
            { this.props.question.output.map((line, i) => (
                <span>
                    {line}
                    { i === this.props.question.output.length - 1 ? null : <br/>}
                </span>) )
            } </pre>);
    }
}