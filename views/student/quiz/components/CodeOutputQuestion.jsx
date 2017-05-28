import React from 'react'

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
            enteredAnswer : ''
        }
	}
    
	render()
    {                                                             
		return (
			<div style={{width : '100%'}} >
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
        let index = this.state.correctOutputLines;
        if (this.state.enteredAnswer !== this.props.question.output[index])
        {
            alert("Wrong answer!");
            return;
        }
        if (this.state.correctOutputLines < this.props.question.output.length)
            {
                this.setState({correctOutputLines : this.state.correctOutputLines + 1, enteredAnswer: ''})
            }
    }
    
    userInputCb(e)
    {
        this.setState({ enteredAnswer : e.target.value })
    }
    
    userInputsShouldRender()
    {
     return (this.state.correctOutputLines < this.props.question.output.length)
    }
    
    getCheckAnswerButton()
    {
        if (!this.userInputsShouldRender())
            return null;
        return (
            <button
                className="btn btn-success"
                style={{width:'100%'}}
                onClick={this.checkUserInput}>
                Check
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
                placeholder = "Enter the next line of output here"
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
        var outputLines = [];
                                                              
        for (let i = 0; i < this.state.correctOutputLines; i++)
        {
                outputLines.push(<span> {this.props.question.output[i]} <br/></span>);
        }
        
        return outputLines;
    }
}