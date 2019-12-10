import React from 'react';
import img from './404.png';

const NotFound = () => (
	<div className="container">
		<div style={{ margin: '100px auto', textAlign: 'center' }}>
			<img src={img} alt="404" />
		</div>
	</div>
);

export default NotFound;
