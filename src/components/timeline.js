import React, { useRef, useEffect, useState } from "react";
import { shortenName } from "../utils/utils";

const styles = {
	timelineFrame: {
		width: "100%",
		height: "100%",
		background: "aliceblue",
		overflow: "hidden",
		WebkitUserSelect: "none" /* Chrome all / Safari all */,
		MozUserSelect: "none" /* Firefox all */,
		msUserSelect: "none" /* IE 10+ */,
		userSelect: "none",
	},
	yearsFrame: {
		width: "100%",
		height: "max-content",
		background: "red",
		position: "fixed",
		zIndex: "500",
	},
};

export const Timeline = ({ ...props }) => {
	const { timelineData, windowWidth, windowHeight } = { ...props };
	const timelineRef = useRef();

	const [timelineSize, setTimelineSize] = useState({ width: windowWidth, height: windowHeight });
	const [yearCount, setYearCount] = useState(1000); // how many years in the screen
	const [selectedYear, setSelectedYear] = useState(1500); // year in the middle
	const [baseLineY, setBaseLineY] = useState(timelineSize.height * 0.97);
	const [yearGap, setYearGap] = useState(timelineSize.width / yearCount);
	const [mouseDown, setMouseDown] = useState(false);

	useEffect(() => {
		let { width, height } = timelineRef.current.getBoundingClientRect();
		setTimelineSize({ width, height });
		setYearGap(width / yearCount);
	}, [windowWidth, windowHeight, yearCount]);

	useEffect(() => {
		timelineRef.current.addEventListener("wheel", (e) => handleWheel(e), { passive: false });
	}, []);

	const zoom = (percentage) => {
		setYearCount((old) => old * percentage);
	};

	const pan = (coordinate, amount) => {
		switch (coordinate) {
			case "x":
				setSelectedYear((old) => old + amount);
				break;
			case "y":
				setBaseLineY((old) => {
					return old + amount;
				});
				break;
		}
	};

	const handleWheel = (event) => {
		const { deltaY, ctrlKey, shiftKey } = event;

		if (ctrlKey) {
			event.preventDefault();
			zoom(1 + deltaY / 2000);
		} else if (shiftKey) {
			pan("y", deltaY / 5);
		} else {
			pan("x", ((yearCount / 50) * deltaY) / 100);
		}
	};

	const handleDrag = (event) => {
		const { screenX, screenY } = event;
		const { x, y, continued } = mouseDown;
		const [deltaX, deltaY] = [screenX - x, screenY - y];
		const coefficient = 0.3;
		if (continued || Math.abs(deltaX) >= 10)
			pan("x", -((yearCount / 2000) * deltaX * coefficient));
		if (continued || Math.abs(deltaY) >= 10) pan("y", deltaY * coefficient);
		setMouseDown({ x: screenX, y: screenY, continued: true });
	};

	const drawGrid = () => {
		const drawBaseLine = () => {
			const posY = baseLineY;
			if (posY < 0 || posY > timelineSize.height) return;

			const lineWidth = 6;

			return (
				<svg
					key={posY}
					width={timelineSize.width}
					height={lineWidth}
					style={{ position: "fixed", top: `${posY}px`, zIndex: "400" }}
				>
					<line
						x1="0"
						y1="0"
						x2={timelineSize.width}
						y2="0"
						stroke="black"
						strokeWidth={lineWidth}
					/>
				</svg>
			);
		};

		const drawIntervals = () => {
			let intervalLines = [];
			const lineWidth = 2;

			for (let i = 0; i <= yearCount; i += 5) {
				const posX = i * yearGap;

				intervalLines.push(
					<svg
						key={i}
						width={lineWidth}
						height={timelineSize.height}
						style={{ position: "fixed", left: `${posX}px`, zIndex: "100" }}
					>
						<line
							x1="0"
							y1="0"
							x2="0"
							y2={timelineSize.height}
							stroke="lightgrey"
							strokeWidth={lineWidth}
						/>
					</svg>
				);
			}
			return intervalLines;
		};

		const drawEndLine = () => {
			const lineWidth = 5;
			const today = new Date().getFullYear();
			const [startYear, endYear] = [
				selectedYear - yearCount / 2,
				selectedYear + yearCount / 2,
			];
			const posX = (today - startYear) * yearGap;
			if (today > startYear && today < endYear)
				return (
					<svg
						key={"endline"}
						width={lineWidth}
						height={timelineSize.height}
						style={{ position: "fixed", left: `${posX}px`, zIndex: "100" }}
					>
						<line
							x1="0"
							y1="0"
							x2="0"
							y2={timelineSize.height}
							stroke="red"
							strokeWidth={lineWidth}
						/>
					</svg>
				);
		};
		return [drawBaseLine(), drawIntervals(), drawEndLine()];
	};

	const drawElements = () => {
		const lineWidth = 4;
		const rowSpacing = 24;
		let reservedRows = [];

		const allocateRow = (birthYear, deathYear) => {
			let allocationIndex = reservedRows.findIndex((item) => item < birthYear);
			if (allocationIndex === -1) {
				allocationIndex = reservedRows.length;
				reservedRows.push(deathYear);
			} else {
				reservedRows[allocationIndex] = deathYear;
			}
			return allocationIndex;
		};

		return timelineData.map((item, index) => {
			const { name, birthYear, deathYear, color } = item;
			const shortName = shortenName(name);
			const lifeSpan = deathYear - birthYear;
			if (lifeSpan <= 0) return console.log(`${item.name} lifespan too short`);
			const lineLength = lifeSpan * yearGap;
			const titleOffset = 18;
			const rowIndex = allocateRow(birthYear, deathYear);
			const posY = baseLineY - rowIndex * rowSpacing - 10;
			const posX = yearGap * (birthYear - selectedYear) + timelineSize.width / 2;
			// if (posY < 0 || posY > timelineSize.height || posX < 0 || posX > timelineSize.width)
			// 	return;

			return (
				<React.Fragment key={index}>
					<span
						key={index}
						style={{
							width: "max-content",
							position: "fixed",
							top: `${posY - titleOffset}px`,
							left: `${posX}px`,
							zIndex: "500",
						}}
					>
						{shortName}
					</span>
					<svg
						key={index + "s"}
						width={lineLength}
						height={lineWidth}
						style={{
							position: "fixed",
							top: `${posY}px`,
							left: `${posX}px`,
							zIndex: "500",
						}}
					>
						<line
							x1="0"
							y1="0"
							x2={lineLength}
							y2="0"
							stroke={color}
							strokeWidth={lineWidth}
						/>
					</svg>
				</React.Fragment>
			);
		});
	};

	const drawYears = () => {
		const startYear = selectedYear - yearCount / 2;
		const endYear = startYear + yearCount;
		const step = Math.ceil(yearCount / 21);
		let smallYears = [];
		for (let year = Math.ceil(startYear); year < endYear; year += step) {
			const posX = ((year - startYear) / yearCount) * timelineSize.width;
			smallYears.push(
				<div key={year} style={{ position: "fixed", top: baseLineY + 3, left: posX }}>
					{year}
				</div>
			);
		}
		return (
			<div className="years-frame" style={{ ...styles.yearsFrame, top: baseLineY + 3 }}>
				{smallYears}
			</div>
		);
	};

	return (
		<div
			className="timeline-frame"
			ref={timelineRef}
			style={styles.timelineFrame}
			onMouseDown={(e) => {
				setMouseDown({ x: e.screenX, y: e.screenY, continued: false });
			}}
			onMouseUp={() => setMouseDown(false)}
			onMouseMove={(e) => {
				if (mouseDown) handleDrag(e);
			}}
		>
			{drawGrid()}
			{drawElements()}
			{drawYears()}
		</div>
	);
};
