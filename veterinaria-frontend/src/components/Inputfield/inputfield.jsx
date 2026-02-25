import "./inputfield.css";

// src/components/InputField.jsx
export function InputField({ label, type, value, onChange }) {
	return (
		<div className="input-group">
			<label>{label}</label>
			<input type={type} value={value} onChange={onChange} />
		</div>
	);
}
