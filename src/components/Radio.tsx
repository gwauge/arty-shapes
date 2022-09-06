import React from "react";

export default function Radio({
    col,
    name,
    value,
    text,
    checked = false,
    onChange = () => { }
}: {
    col: number,
    name: string,
    value: string,
    text: string,
    checked?: boolean,
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
    return (
        <div className={`col-${col}`}>
            <input
                type="radio"
                className="btn-check"
                name={`options-${name}`}
                id={`${name}-${value}`}
                value={value}
                autoComplete="off"
                defaultChecked={checked}
                onChange={onChange}
            />
            <label
                className="btn btn-outline-secondary w-100 px-0 border-2"
                htmlFor={`${name}-${value}`}
            >{text}</label>
        </div>
    );
}