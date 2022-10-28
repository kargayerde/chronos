import "./App.css";
import { Timeline } from "./components/timeline";
import { useWindowResize } from "./hooks/useWindowResize";
import timelineData from "./assets/timelineData.json";

function App() {
	const [windowWidth, windowHeight] = useWindowResize();

	const timelineDataProps = {
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

	return (
		<div className="App">
			<Timeline {...timelineDataProps} />
		</div>
	);
}

export default App;
