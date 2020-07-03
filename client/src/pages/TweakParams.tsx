import React, { useEffect, useState } from 'react';
import useSliders from '../hooks/useSliders';
import API from '../api';

const TweakParams: React.FC = () => {
	const [maxArea, minArea, AreaSliders] = useSliders('Area');
	const [maxRadius, minRadius, RadiusSliders] = useSliders('Radius');

	useEffect(() => {
		//send request to server
		// API.post()
	}, [maxArea, minArea, maxRadius, minRadius]);
	return (
		<div>
			<div className="p5-space" style={{ height: '200px', width: '20px' }}>
				<img src="" alt="" />
			</div>
			<AreaSliders />
			<RadiusSliders />
		</div>
	);
};

export default TweakParams;
