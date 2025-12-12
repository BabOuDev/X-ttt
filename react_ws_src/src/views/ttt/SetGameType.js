import React, {Component} from 'react'

export default class SetGameType extends Component {

	constructor (props) {
		super(props)

		this.state = {}
	}

//	------------------------	------------------------	------------------------

	render () {
		return (
			<div id='SetGameType'>

				<h1>Choose game mode</h1>

				<h2>2D Classic Mode</h2>
				<button type='submit' onClick={this.selType2DLive.bind(this)} className='button long'><span>2D Live (vs Player) <span className='fa fa-caret-right'></span></span></button>

				&nbsp;&nbsp;&nbsp;&nbsp;

				<button type='submit' onClick={this.selType2DComp.bind(this)} className='button long'><span>2D vs Computer <span className='fa fa-caret-right'></span></span></button>

				<br /><br />

				<h2>3D Cube Mode</h2>
				<button type='submit' onClick={this.selType3DLive.bind(this)} className='button long'><span>3D Live (vs Player) <span className='fa fa-caret-right'></span></span></button>

				&nbsp;&nbsp;&nbsp;&nbsp;

				<button type='submit' onClick={this.selType3DComp.bind(this)} className='button long'><span>3D vs Computer <span className='fa fa-caret-right'></span></span></button>

			</div>
		)
	}

//	------------------------	------------------------	------------------------

	selType2DLive (e) {
		this.props.onSetType('live', '2d')
	}

//	------------------------	------------------------	------------------------

	selType2DComp (e) {
		this.props.onSetType('comp', '2d')
	}

//	------------------------	------------------------	------------------------

	selType3DLive (e) {
		this.props.onSetType('live', '3d')
	}

//	------------------------	------------------------	------------------------

	selType3DComp (e) {
		this.props.onSetType('comp', '3d')
	}

}
