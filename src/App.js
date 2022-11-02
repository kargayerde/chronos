import "./App.css";
import { Timeline } from "./components/timeline";
import { SettingsBox } from "./components/settingsBox";
import { useWindowResize } from "./hooks/useWindowResize";
import exampleData from "./assets/exampleData.json";
import { useState, useEffect } from "react";

function App() {
	const [windowWidth, windowHeight] = useWindowResize();
	const localData = JSON.parse(localStorage.getItem("timeline-data"));
	const [timelineData, setTimelineData] = useState(localData || exampleData);
	const [settingsBoxOpen, setSettingsBoxOpen] = useState(true);

	const timelineProps = {
		timelineData: timelineData
			.sort((a, b) => a.birthYear - b.birthYear)
			.map((item) => {
				return {
					...item,
					color: `hsl(
						${Math.floor(Math.random() * 360)},
						${Math.floor(Math.random() * 100)}%,
						${Math.min(Math.floor(Math.random() * 100), 70)}%)`,
				};
			}),
		windowWidth,
		windowHeight,
	};

	const settingsBoxProps = { timelineData, setTimelineData, exampleData };

	useEffect(() => {
		localStorage.setItem("timeline-data", JSON.stringify(timelineData));
	}, [timelineData]);

	return (
		<div className="App">
			<Timeline {...timelineProps} />
			<button
				style={{ position: "fixed", top: "10px", left: "10px", zIndex: 800 }}
				onClick={() => setSettingsBoxOpen((old) => !old)}
			>
				Settings
			</button>
			{settingsBoxOpen ? <SettingsBox {...settingsBoxProps} /> : null}
		</div>
	);
}

export default App;
