import { useState } from "react";

const styles = {
	settingsBox: {
		width: "max-content",
		height: "max-content",
		background: "bisque",
		zIndex: 1000,
		position: "fixed",
		top: "30px",
		left: "10px",
		padding: "10px",
	},
	inputField: {
		width: "74px",
	},
	nameInputField: { width: "140px" },
	largeInputField: {
		width: "300px",
		height: "114px",
		maxWidth: "300px",
		minWidth: "300px",
		maxHeight: "114px",
		minHeight: "114px",
	},
	messageBox: {
		width: "300px",
		maxWidth: "300px",
		height: "max-content",
		maxHeight: "100px",
		background: "whitesmoke",
		padding: "2px",
		overflowY: "auto",
		overflowX: "none",
		fontSize: ".8rem",
	},
};

export const SettingsBox = ({ ...props }) => {
	const { timelineData, setTimelineData, exampleData } = props;
	const columns =
		timelineData.length >= 1
			? Object.keys(timelineData[0])
			: ["name", "birthYear", "deathYear", "activityStart", "activityEnd", "field", "notes"];
	const [addFormData, setAddFormData] = useState(
		Object.fromEntries(columns.map((item) => [item, null]))
	);
	const [removeFormData, setRemoveFormData] = useState();
	const [importFormData, setImportFormData] = useState();
	const [messageData, setMessageData] = useState();

	const displayMessage = (message) => {
		setMessageData(message);
	};

	const HandleExport = (type) => {
		switch (type) {
			case "csv":
				navigator.clipboard.writeText(
					timelineData
						.map((item, index) => {
							if (index === 0)
								return (
									Object.keys(item).join(",") +
									"\n" +
									Object.values(item).join(",")
								);
							else return Object.values(item).join(",");
						})
						.join("\n")
				);
				break;
			case "json":
				if (type === "json") {
					navigator.clipboard.writeText(JSON.stringify(timelineData));
				}
				break;

			default:
				displayMessage("copied to clipboard");
				break;
		}
	};

	const HandleImport = (type) => {
		switch (type) {
			case "csv":
				const rows = importFormData.split("\n");
				const headers = rows[0].split(",");
				let result = [];
				rows.forEach((item, index) => {
					if (index !== 0) {
						const rowArray = item.split(",");

						result.push(
							Object.fromEntries(
								headers.map((item, place) => [item, rowArray[place]])
							)
						);
					}
				});
				displayMessage("imported csv");
				setTimelineData(result);

				break;
			case "json":
				setTimelineData(JSON.parse(importFormData));
				displayMessage("imported json");
				break;
		}
	};

	const HandleResetData = () => {
		setTimelineData([]);
	};

	const handleAdd = () => {
		const { name, birthYear, deathYear } = addFormData;
		if (name === null || birthYear === null || deathYear === null) {
			displayMessage("name, birth & death is mandatory");
		} else if (timelineData.find((item) => item.name.toLowerCase() === name.toLowerCase())) {
			displayMessage("item with same name exists");
		} else if (isNaN(birthYear) || isNaN(deathYear) || deathYear <= birthYear) {
			displayMessage("fix birth & death years");
		} else {
			displayMessage("added item");
			setTimelineData((old) => [...old, addFormData]);
		}
	};
	const handleRemove = () => {
		displayMessage("trying to remove " + removeFormData);
		const matchArray = timelineData.filter((item) =>
			item.name.toLowerCase().includes(removeFormData.toLowerCase())
		);
		if (matchArray.length > 1)
			displayMessage(
				`multiple matches, refine search parameter: (${matchArray
					.map((item) => item.name)
					.join(", ")})`
			);
		else if (matchArray.length === 0) displayMessage("no matches");
		else if (matchArray.length === 1) {
			setTimelineData((old) => {
				let ret = [...old];
				let spliceIndex = ret.indexOf(...matchArray);
				ret.splice(spliceIndex, 1);
				return ret;
			});
			displayMessage(
				`removed ${matchArray[0].name} (${matchArray[0].birthYear} - ${matchArray[0].deathYear})`
			);
		}
	};

	const renderAddForm = () => {
		return columns.map((item, index) => (
			<input
				key={item}
				type="text"
				name={item}
				placeholder={item}
				style={index === 0 ? styles.nameInputField : styles.inputField}
				onChange={(e) =>
					setAddFormData((old) => {
						const newData = { ...old };
						newData[item] = e.target.value;
						return newData;
					})
				}
			/>
		));
	};

	return (
		<div className="settings-box-frame" style={styles.settingsBox}>
			<div className="add-remove-frame">
				<div className="add-frame">
					<div>Add Item: </div>
					{renderAddForm()}
					<button onClick={() => handleAdd()}>ADD</button>
				</div>
				<div className="remove-frame">
					<div>Remove Item: </div>
					<input
						type="text"
						placeholder="item name to delete"
						onChange={(e) => setRemoveFormData(e.target.value)}
					/>
					<button onClick={() => handleRemove()}>REM</button>
				</div>
			</div>
			<span className="import-export-frame">
				<div>Import & Export: </div>
				<div style={{ display: "flex" }}>
					<textarea
						className="import-export-text"
						placeholder="paste CSV/JSON to import"
						style={styles.largeInputField}
						onChange={(e) => setImportFormData(e.target.value)}
					></textarea>
					<span
						className="import-export-button-grid"
						style={{ display: "flex", flexDirection: "column", width: "max-content" }}
					>
						<button onClick={() => HandleImport("json")}>Import JSON</button>
						<button onClick={() => HandleImport("csv")}>Import CSV</button>
						<button onClick={() => HandleExport("json")}>Copy JSON</button>
						<button onClick={() => HandleExport("csv")}>Copy CSV</button>
						<button onClick={() => HandleResetData()}>Delete All Data</button>
						<button onClick={() => setTimelineData(exampleData)}>
							Load Example Data
						</button>
					</span>
				</div>
			</span>
			<div className="message-box" style={styles.messageBox}>
				{messageData}
			</div>
		</div>
	);
};
