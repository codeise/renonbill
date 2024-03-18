import React, {useState} from "react"
import {ButtonGroup, ToggleButton} from "react-bootstrap";

function ToggleButtonGroup() {
    const [radioValue, setRadioValue] = useState('1');

    const radios = [
        { name: 'New', value: '1' },
        { name: 'Edit', value: '2' },
    ];

    return (
        <>
            <ButtonGroup toggle>
                {radios.map((radio, idx) => (
                    <ToggleButton
                        key={idx}
                        type="radio"
                        variant="secondary"
                        name="radio"
                        value={radio.value}
                        checked={radioValue === radio.value}
                        onChange={(e) => setRadioValue(e.currentTarget.value)}
                    >
                        {radio.name}
                    </ToggleButton>
                ))}
            </ButtonGroup>
        </>
    );
}
export default ToggleButtonGroup