import React, {Component} from 'react'

import io from 'socket.io-client'
import THREE from 'three'

import rand_arr_elem from '../../helpers/rand_arr_elem'
import rand_to_fro from '../../helpers/rand_to_fro'
import { coordsToId, idToCoords } from '../../helpers/cell3d_helpers'
import { generate3DWinSets } from '../../helpers/win_sets_3d'

export default class GameMain3D extends Component {

	constructor (props) {
		super(props)

		// Generate all 49 winning combinations for 3D tic tac toe
		this.win_sets = generate3DWinSets()

		// Initialize Three.js-related properties
		this.scene = null
		this.camera = null
		this.renderer = null
		this.raycaster = null
		this.mouse = new THREE.Vector2()
		this.cells = {} // Store references to 3D cell objects
		this.isDragging = false
		this.previousMousePosition = { x: 0, y: 0 }
		this.autoRotate = false

		if (this.props.game_type != 'live')
			this.state = {
				cell_vals: {},
				next_turn_ply: true,
				game_play: true,
				game_stat: 'Start game',
				showWinAnimation: false,
				showLossAnimation: false
			}
		else {
			this.sock_start()

			this.state = {
				cell_vals: {},
				next_turn_ply: true,
				game_play: false,
				game_stat: 'Connecting',
				showWinAnimation: false,
				showLossAnimation: false
			}
		}
	}

//	------------------------	------------------------	------------------------

	componentDidMount () {
		this.initThreeJS()
	}

//	------------------------	------------------------	------------------------

	componentWillUnmount () {
		this.socket && this.socket.disconnect()
		this.cleanupThreeJS()
	}

//	------------------------	------------------------	------------------------
//	THREE.JS INITIALIZATION
//	------------------------	------------------------	------------------------

	initThreeJS() {
		if (!this.mount) return

		const width = 600
		const height = 600

		// Scene
		this.scene = new THREE.Scene()
		this.scene.background = new THREE.Color(0x1a1a2e)

		// Camera
		this.camera = new THREE.PerspectiveCamera(50, width/height, 0.1, 1000)
		this.camera.position.set(8, 8, 8)
		this.camera.lookAt(new THREE.Vector3(1.5, 1.5, 1.5))

		// Renderer
		this.renderer = new THREE.WebGLRenderer({ antialias: true })
		this.renderer.setSize(width, height)
		this.mount.appendChild(this.renderer.domElement)

		// Lighting
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
		this.scene.add(ambientLight)

		const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8)
		directionalLight1.position.set(10, 10, 5)
		this.scene.add(directionalLight1)

		const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3)
		directionalLight2.position.set(-10, -10, -5)
		this.scene.add(directionalLight2)

		// Create 27 cell objects
		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				for (let z = 0; z < 3; z++) {
					this.createCell(x, y, z)
				}
			}
		}

		// Raycaster for click detection
		this.raycaster = new THREE.Raycaster()

		// Mouse events
		this.renderer.domElement.addEventListener('click', this.onCanvasClick.bind(this))
		this.renderer.domElement.addEventListener('mousemove', this.onCanvasMouseMove.bind(this))

		// Camera controls - right-click to rotate
		this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this))
		this.renderer.domElement.addEventListener('mousemove', this.onMouseDrag.bind(this))
		this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this))
		this.renderer.domElement.addEventListener('contextmenu', this.onContextMenu.bind(this))

		// Start render loop
		this.animate()
	}

//	------------------------	------------------------	------------------------

	createCell(x, y, z) {
		const cellId = coordsToId(x, y, z)
		const spacing = 1.5

		// Create a group for the cell (frame + fill)
		const cellGroup = new THREE.Group()
		cellGroup.position.set(x * spacing, y * spacing, z * spacing)

		// Outer wireframe (edges)
		const edgesGeometry = new THREE.BoxGeometry(0.85, 0.85, 0.85)
		const edges = new THREE.EdgesGeometry(edgesGeometry)
		const lineMaterial = new THREE.LineBasicMaterial({
			color: 0x00aaff,
			linewidth: 2,
			transparent: true,
			opacity: 0.7
		})
		const wireframe = new THREE.LineSegments(edges, lineMaterial)
		cellGroup.add(wireframe)

		// Semi-transparent fill (glass-like effect)
		const fillGeometry = new THREE.BoxGeometry(0.83, 0.83, 0.83)
		const fillMaterial = new THREE.MeshPhysicalMaterial({
			color: 0x1a3a5a,
			transparent: true,
			opacity: 0.08,
			metalness: 0.1,
			roughness: 0.3,
			clearcoat: 0.5,
			clearcoatRoughness: 0.3,
			side: THREE.DoubleSide
		})
		const fillMesh = new THREE.Mesh(fillGeometry, fillMaterial)
		cellGroup.add(fillMesh)

		// Store references for hover effects
		cellGroup.userData = {
			cellId: cellId,
			x: x,
			y: y,
			z: z,
			type: 'empty',
			wireframe: wireframe,
			fill: fillMesh
		}

		this.scene.add(cellGroup)
		this.cells[cellId] = { empty: cellGroup, piece: null }
	}

//	------------------------	------------------------	------------------------

	createXPiece(x, y, z) {
		const group = new THREE.Group()
		const spacing = 1.5

		// Two intersecting boxes forming X shape
		const geometry1 = new THREE.BoxGeometry(0.2, 1.2, 0.2)
		const geometry2 = new THREE.BoxGeometry(0.2, 1.2, 0.2)
		const material = new THREE.MeshStandardMaterial({
			color: 0xff4444,
			metalness: 0.3,
			roughness: 0.4
		})

		const bar1 = new THREE.Mesh(geometry1, material)
		bar1.rotation.z = Math.PI / 4

		const bar2 = new THREE.Mesh(geometry2, material)
		bar2.rotation.z = -Math.PI / 4

		group.add(bar1)
		group.add(bar2)
		group.position.set(x * spacing, y * spacing, z * spacing)

		return group
	}

//	------------------------	------------------------	------------------------

	createOPiece(x, y, z) {
		const spacing = 1.5
		const geometry = new THREE.TorusGeometry(0.5, 0.15, 16, 32)
		const material = new THREE.MeshStandardMaterial({
			color: 0x4444ff,
			emissive: 0x222255,
			metalness: 0.3,
			roughness: 0.4
		})

		const mesh = new THREE.Mesh(geometry, material)
		mesh.position.set(x * spacing, y * spacing, z * spacing)
		// Torus now faces same direction as X (upright/vertical)

		return mesh
	}

//	------------------------	------------------------	------------------------

	animate() {
		if (!this.renderer) return

		requestAnimationFrame(this.animate.bind(this))

		// Auto-rotate if enabled
		if (this.autoRotate && this.camera) {
			const center = new THREE.Vector3(1.5, 1.5, 1.5)
			const offset = this.camera.position.clone().sub(center)
			const axis = new THREE.Vector3(0, 1, 0)
			offset.applyAxisAngle(axis, 0.005)
			this.camera.position.copy(center).add(offset)
			this.camera.lookAt(center)
		}

		this.renderer.render(this.scene, this.camera)
	}

//	------------------------	------------------------	------------------------

	cleanupThreeJS() {
		if (this.renderer && this.mount) {
			this.mount.removeChild(this.renderer.domElement)
			this.renderer.dispose()
		}

		// Clean up geometries and materials
		Object.values(this.cells).forEach(cell => {
			if (cell.empty) {
				cell.empty.geometry.dispose()
				cell.empty.material.dispose()
			}
			if (cell.piece) {
				this.disposePiece(cell.piece)
			}
		})
	}

//	------------------------	------------------------	------------------------

	disposePiece(piece) {
		if (piece.type === 'Group') {
			piece.children.forEach(child => {
				if (child.geometry) child.geometry.dispose()
				if (child.material) child.material.dispose()
			})
		} else {
			if (piece.geometry) piece.geometry.dispose()
			if (piece.material) piece.material.dispose()
		}
	}

//	------------------------	------------------------	------------------------
//	CLICK DETECTION & CAMERA CONTROLS
//	------------------------	------------------------	------------------------

	onCanvasClick(event) {
		if (!this.state.game_play || !this.state.next_turn_ply) return

		const rect = this.renderer.domElement.getBoundingClientRect()
		this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
		this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

		this.raycaster.setFromCamera(this.mouse, this.camera)

		// Get all children of empty cell groups for raycasting
		const emptyMeshes = []
		Object.values(this.cells).forEach(cell => {
			if (cell.empty.userData.type === 'empty') {
				cell.empty.children.forEach(child => emptyMeshes.push(child))
			}
		})

		const intersects = this.raycaster.intersectObjects(emptyMeshes)

		if (intersects.length > 0) {
			const cellGroup = intersects[0].object.parent
			if (cellGroup && cellGroup.userData && cellGroup.userData.cellId) {
				const cellId = cellGroup.userData.cellId
				this.click_cell({ target: { id: cellId } })
			}
		}
	}

//	------------------------	------------------------	------------------------

	onCanvasMouseMove(event) {
		if (!this.renderer) return

		const rect = this.renderer.domElement.getBoundingClientRect()
		this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
		this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

		this.raycaster.setFromCamera(this.mouse, this.camera)

		// Get all children of empty cell groups for raycasting
		const emptyMeshes = []
		Object.values(this.cells).forEach(cell => {
			if (cell.empty.userData.type === 'empty') {
				cell.empty.children.forEach(child => emptyMeshes.push(child))
			}
		})

		const intersects = this.raycaster.intersectObjects(emptyMeshes)

		// Reset all hover states
		Object.values(this.cells).forEach(cell => {
			if (cell.empty.userData.type === 'empty') {
				const wireframe = cell.empty.userData.wireframe
				const fill = cell.empty.userData.fill
				if (wireframe && wireframe.material) {
					wireframe.material.opacity = 0.7
					wireframe.material.color.setHex(0x00aaff)
				}
				if (fill && fill.material) {
					fill.material.opacity = 0.08
					fill.material.color.setHex(0x1a3a5a)
				}
			}
		})

		// Highlight hovered cell with player-specific color
		if (intersects.length > 0 && this.state.game_play) {
			const hoveredGroup = intersects[0].object.parent
			if (hoveredGroup && hoveredGroup.userData) {
				const wireframe = hoveredGroup.userData.wireframe
				const fill = hoveredGroup.userData.fill

				// Use red for X player (next_turn_ply === true), blue for O player
				const playerColor = this.state.next_turn_ply ? 0xff4444 : 0x4444ff

				if (wireframe && wireframe.material) {
					wireframe.material.opacity = 1.0
					wireframe.material.color.setHex(playerColor)
				}
				if (fill && fill.material) {
					fill.material.opacity = 0.35
					fill.material.color.setHex(playerColor)
				}
			}
		}
	}

//	------------------------	------------------------	------------------------

	onMouseDown(event) {
		// Only start dragging on right mouse button
		if (event.button === 2) {
			this.isDragging = true
			this.previousMousePosition = { x: event.clientX, y: event.clientY }
		}
	}

//	------------------------	------------------------	------------------------

	onMouseDrag(event) {
		if (!this.isDragging || !this.camera) return

		const deltaX = event.clientX - this.previousMousePosition.x
		const deltaY = event.clientY - this.previousMousePosition.y

		const center = new THREE.Vector3(1.5, 1.5, 1.5)
		const offset = this.camera.position.clone().sub(center)

		// Horizontal rotation (around Y axis)
		const quaternionY = new THREE.Quaternion()
		quaternionY.setFromAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * 0.005)
		offset.applyQuaternion(quaternionY)

		// Vertical rotation (around camera's right axis)
		const right = new THREE.Vector3(1, 0, 0)
		right.applyQuaternion(this.camera.quaternion)
		const quaternionX = new THREE.Quaternion()
		quaternionX.setFromAxisAngle(right, deltaY * 0.005)
		offset.applyQuaternion(quaternionX)

		this.camera.position.copy(center).add(offset)
		this.camera.lookAt(center)

		this.previousMousePosition = { x: event.clientX, y: event.clientY }
	}

//	------------------------	------------------------	------------------------

	onMouseUp(event) {
		this.isDragging = false
	}

//	------------------------	------------------------	------------------------

	onContextMenu(event) {
		// Prevent default context menu when right-clicking on canvas
		event.preventDefault()
		return false
	}

//	------------------------	------------------------	------------------------

	resetCamera() {
		if (!this.camera) return
		this.camera.position.set(8, 8, 8)
		this.camera.lookAt(1.5, 1.5, 1.5)
	}

//	------------------------	------------------------	------------------------

	zoomIn() {
		if (!this.camera) return
		const center = new THREE.Vector3(1.5, 1.5, 1.5)
		const direction = this.camera.position.clone().sub(center)
		const distance = direction.length()

		if (distance > 3) { // Minimum zoom distance
			direction.normalize().multiplyScalar(distance - 1)
			this.camera.position.copy(center).add(direction)
		}
	}

//	------------------------	------------------------	------------------------

	zoomOut() {
		if (!this.camera) return
		const center = new THREE.Vector3(1.5, 1.5, 1.5)
		const direction = this.camera.position.clone().sub(center)
		const distance = direction.length()

		if (distance < 20) { // Maximum zoom distance
			direction.normalize().multiplyScalar(distance + 1)
			this.camera.position.copy(center).add(direction)
		}
	}

//	------------------------	------------------------	------------------------

	rotateCamera(direction) {
		if (!this.camera) return
		const center = new THREE.Vector3(1.5, 1.5, 1.5)
		const rotationAngle = Math.PI / 2 // 90 degrees

		switch(direction) {
			case 'left':
				// Rotate camera 90 degrees left around Y axis
				const leftOffset = this.camera.position.clone().sub(center)
				leftOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationAngle)
				this.camera.position.copy(center).add(leftOffset)
				break
			case 'right':
				// Rotate camera 90 degrees right around Y axis
				const rightOffset = this.camera.position.clone().sub(center)
				rightOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), -rotationAngle)
				this.camera.position.copy(center).add(rightOffset)
				break
			case 'up':
				// Rotate camera 90 degrees up
				const upOffset = this.camera.position.clone().sub(center)
				const rightAxis = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion)
				upOffset.applyAxisAngle(rightAxis, -rotationAngle)
				this.camera.position.copy(center).add(upOffset)
				break
			case 'down':
				// Rotate camera 90 degrees down
				const downOffset = this.camera.position.clone().sub(center)
				const rightAxis2 = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion)
				downOffset.applyAxisAngle(rightAxis2, rotationAngle)
				this.camera.position.copy(center).add(downOffset)
				break
		}
		this.camera.lookAt(center)
	}

//	------------------------	------------------------	------------------------

	toggleAutoRotate() {
		this.autoRotate = !this.autoRotate
	}

//	------------------------	------------------------	------------------------
//	GAME END ANIMATIONS
//	------------------------	------------------------	------------------------

	createConfetti() {
		const confetti = []
		const numConfetti = 100

		for (let i = 0; i < numConfetti; i++) {
			const left = Math.random() * 100
			const animationDelay = Math.random() * 0.5
			const animationDuration = 2 + Math.random() * 1

			confetti.push(
				<div
					key={i}
					className="confetti"
					style={{
						left: `${left}%`,
						animationDelay: `${animationDelay}s`,
						animationDuration: `${animationDuration}s`
					}}
				/>
			)
		}
		return confetti
	}

	createDefeatParticles() {
		const particles = []
		const numParticles = 50

		for (let i = 0; i < numParticles; i++) {
			const left = Math.random() * 100
			const animationDelay = Math.random() * 1
			const animationDuration = 1.5 + Math.random() * 0.5

			particles.push(
				<div
					key={i}
					className="defeat-particle"
					style={{
						left: `${left}%`,
						animationDelay: `${animationDelay}s`,
						animationDuration: `${animationDuration}s`
					}}
				/>
			)
		}
		return particles
	}

//	------------------------	------------------------	------------------------
//	SOCKET.IO MULTIPLAYER
//	------------------------	------------------------	------------------------

	sock_start () {
		this.socket = io(app.settings.ws_conf.loc.SOCKET__io.u)

		this.socket.on('connect', function(data) {
			this.socket.emit('new player', { name: app.settings.curr_user.name })
		}.bind(this))

		this.socket.on('pair_players', function(data) {
			this.setState({
				next_turn_ply: data.mode=='m',
				game_play: true,
				game_stat: 'Playing with ' + data.opp.name
			})
		}.bind(this))

		this.socket.on('opp_turn', this.turn_opp_live.bind(this))
	}

//	------------------------	------------------------	------------------------
//	RENDER
//	------------------------	------------------------	------------------------

	render () {
		return (
			<div id='GameMain3D'>

				<h1>Play 3D {this.props.game_type}</h1>

				<div id="game_stat">
					<div id="game_stat_msg">{this.state.game_stat}</div>
					{this.state.game_play && <div id="game_turn_msg">{this.state.next_turn_ply ? 'Your turn' : 'Opponent turn'}</div>}
				</div>

				<div className="canvas-wrapper">

          <div className="three-canvas-container" ref={el => this.mount = el} />


					{/* Camera Controls - Above Canvas */}
					<div className="canvas-controls">
						{/* Directional Arrows - Left Side */}
						<div className="direction-controls">
							<button onClick={() => this.rotateCamera('up')} className='control-btn' title="Rotate Up (90°)">
								<span className='fa fa-chevron-up'></span>
							</button>
							<div className="horizontal-controls">
								<button onClick={() => this.rotateCamera('left')} className='control-btn' title="Rotate Left (90°)">
									<span className='fa fa-chevron-left'></span>
								</button>
								<button onClick={this.resetCamera.bind(this)} className='control-btn center' title="Reset Camera">
									<span className='fa fa-dot-circle-o'></span>
								</button>
								<button onClick={() => this.rotateCamera('right')} className='control-btn' title="Rotate Right (90°)">
									<span className='fa fa-chevron-right'></span>
								</button>
							</div>
							<button onClick={() => this.rotateCamera('down')} className='control-btn' title="Rotate Down (90°)">
								<span className='fa fa-chevron-down'></span>
							</button>
						</div>

						{/* Zoom Controls - Right Side */}
						<div className="zoom-controls">
							<button onClick={this.zoomIn.bind(this)} className='control-btn' title="Zoom In">
								<span className='fa fa-plus'></span>
							</button>
							<button onClick={this.zoomOut.bind(this)} className='control-btn' title="Zoom Out">
								<span className='fa fa-minus'></span>
							</button>
						</div>

						{/* Auto-Rotate Toggle - Far Right */}
						<div className="rotate-control">
							<button onClick={this.toggleAutoRotate.bind(this)} className='control-btn' title={this.autoRotate ? 'Stop Rotation' : 'Auto-Rotate'}>
								<span className={this.autoRotate ? 'fa fa-pause' : 'fa fa-rotate-right'}></span>
							</button>
						</div>
					</div>

          {/* Instructions */}
          <div className="control-instructions">
						<span className="instruction-item">
							<span className="fa fa-mouse-pointer"></span> Left-click cells to play
						</span>
            <span className="instruction-separator">•</span>
            <span className="instruction-item">
							<span className="fa fa-hand-rock-o"></span> Right-click + drag to rotate
						</span>
            <span className="instruction-separator">•</span>
            <span className="instruction-item">
							<span className="fa fa-arrows"></span> Use buttons for 90° turns
						</span>
          </div>
				</div>

				<button type='submit' onClick={this.playAgain.bind(this)} className='button'>
					<span>Play Again <span className='fa fa-refresh'></span></span>
				</button>

				{/* Win Animation */}
				{this.state.showWinAnimation && (
					<div className="game-end-animation">
						<div className="celebration-text">🎉 You Win! 🎉</div>
						<div className="confetti-container">
							{this.createConfetti()}
						</div>
					</div>
				)}

				{/* Loss Animation */}
				{this.state.showLossAnimation && (
					<div className="game-end-animation">
						<div className="defeat-text">You Lost</div>
						<div className="defeat-container">
							{this.createDefeatParticles()}
						</div>
					</div>
				)}

			</div>
		)
	}

//	------------------------	------------------------	------------------------
//	GAME LOGIC
//	------------------------	------------------------	------------------------

	click_cell (e) {
		if (!this.state.next_turn_ply || !this.state.game_play) return

		const cell_id = e.target.id
		if (this.state.cell_vals[cell_id]) return

		if (this.props.game_type != 'live')
			this.turn_ply_comp(cell_id)
		else
			this.turn_ply_live(cell_id)
	}

//	------------------------	------------------------	------------------------

	turn_ply_comp (cell_id) {
		let { cell_vals } = this.state

		cell_vals[cell_id] = 'x'

		// Render X piece in 3D
		const [x, y, z] = idToCoords(cell_id)
		const piece = this.createXPiece(x, y, z)
		this.scene.add(piece)
		this.cells[cell_id].piece = piece
		this.cells[cell_id].empty.userData.type = 'occupied'

		this.state.cell_vals = cell_vals

		this.check_turn()
	}

//	------------------------	------------------------	------------------------

	turn_comp () {
		let { cell_vals } = this.state
		let empty_cells = []

		// Find all empty cells
		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				for (let z = 0; z < 3; z++) {
					const cell_id = coordsToId(x, y, z)
					if (!cell_vals[cell_id]) {
						empty_cells.push(cell_id)
					}
				}
			}
		}

		if (empty_cells.length === 0) return

		const cell_id = rand_arr_elem(empty_cells)
		const [x, y, z] = idToCoords(cell_id)

		cell_vals[cell_id] = 'o'

		// Render O piece in 3D
		const piece = this.createOPiece(x, y, z)
		this.scene.add(piece)
		this.cells[cell_id].piece = piece
		this.cells[cell_id].empty.userData.type = 'occupied'

		this.state.cell_vals = cell_vals

		this.check_turn()
	}

//	------------------------	------------------------	------------------------

	turn_ply_live (cell_id) {
		let { cell_vals } = this.state

		cell_vals[cell_id] = 'x'

		// Render X piece in 3D
		const [x, y, z] = idToCoords(cell_id)
		const piece = this.createXPiece(x, y, z)
		this.scene.add(piece)
		this.cells[cell_id].piece = piece
		this.cells[cell_id].empty.userData.type = 'occupied'

		this.socket.emit('ply_turn', { cell_id: cell_id })

		this.state.cell_vals = cell_vals

		this.check_turn()
	}

//	------------------------	------------------------	------------------------

	turn_opp_live (data) {
		let { cell_vals } = this.state

		const cell_id = data.cell_id
		const [x, y, z] = idToCoords(cell_id)

		cell_vals[cell_id] = 'o'

		// Render opponent's O piece
		const piece = this.createOPiece(x, y, z)
		this.scene.add(piece)
		this.cells[cell_id].piece = piece
		this.cells[cell_id].empty.userData.type = 'occupied'

		this.state.cell_vals = cell_vals

		this.check_turn()
	}

//	------------------------	------------------------	------------------------

	check_turn () {
		const { cell_vals } = this.state

		let win = false
		let winning_set = null

		if (this.props.game_type!='live')
			this.state.game_stat = 'Play'

		// Check all 49 win sets
		for (let i=0; !win && i<this.win_sets.length; i++) {
			const set = this.win_sets[i]
			const first = cell_vals[set[0]]
			if (first && first === cell_vals[set[1]] && first === cell_vals[set[2]]) {
				win = true
				winning_set = set
			}
		}

		// Check for draw (all 27 cells filled)
		let filled_count = 0
		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				for (let z = 0; z < 3; z++) {
					if (cell_vals[coordsToId(x, y, z)]) filled_count++
				}
			}
		}

		if (win) {
			// Animate winning pieces
			winning_set.forEach(cellId => {
				const cell = this.cells[cellId]
				if (cell.piece) {
					this.animateWinningPiece(cell.piece)
				}
			})

			const playerWon = cell_vals[winning_set[0]]=='x'

			this.setState({
				game_stat: (playerWon ?'You':'Opponent')+' win',
				game_play: false,
				showWinAnimation: playerWon,
				showLossAnimation: !playerWon
			})

			this.socket && this.socket.disconnect()

		} else if (filled_count === 27) {
			this.setState({
				game_stat: 'Draw',
				game_play: false
			})

			this.socket && this.socket.disconnect()

		} else {
			this.props.game_type!='live' && this.state.next_turn_ply && setTimeout(this.turn_comp.bind(this), rand_to_fro(500, 1000))

			this.setState({
				next_turn_ply: !this.state.next_turn_ply
			})
		}
	}

//	------------------------	------------------------	------------------------

	animateWinningPiece(piece) {
		const startTime = Date.now()
		const duration = 1000

		const animate = () => {
			const elapsed = Date.now() - startTime
			const progress = (elapsed % duration) / duration
			const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.15

			piece.scale.set(scale, scale, scale)

			if (this.state.game_play === false) {
				requestAnimationFrame(animate)
			} else {
				piece.scale.set(1, 1, 1)
			}
		}

		animate()
	}

//	------------------------	------------------------	------------------------

	playAgain () {
		// Disconnect existing socket if any
		if (this.socket) {
			this.socket.disconnect()
			this.socket = null
		}

		// Remove all pieces from the scene
		Object.values(this.cells).forEach(cell => {
			if (cell.piece) {
				this.scene.remove(cell.piece)
				this.disposePiece(cell.piece)
				cell.piece = null
			}
			// Reset cell type to empty
			if (cell.empty && cell.empty.userData) {
				cell.empty.userData.type = 'empty'
			}
		})

		// Reset game state
		if (this.props.game_type === 'live') {
			// Reconnect for live mode
			this.sock_start()
			this.setState({
				cell_vals: {},
				next_turn_ply: true,
				game_play: false,
				game_stat: 'Connecting',
				showWinAnimation: false,
				showLossAnimation: false
			})
		} else {
			// Reset for computer mode
			this.setState({
				cell_vals: {},
				next_turn_ply: true,
				game_play: true,
				game_stat: 'Start game',
				showWinAnimation: false,
				showLossAnimation: false
			})
		}
	}

//	------------------------	------------------------	------------------------

	end_game () {
		this.socket && this.socket.disconnect()

		this.props.onEndGame()
	}

}
