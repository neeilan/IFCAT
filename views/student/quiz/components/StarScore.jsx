import React from 'react'

export default class StarScore extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		var stars = [];
		for (var i = 0; i < this.props.full; i++)
			stars.push('F');
		for (var i = 0; i < this.props.empty; i++)
			stars.push('E');
		return (<div>{stars.join()}</div>);

	}
}
