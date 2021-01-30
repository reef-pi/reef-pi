import React, {Component} from 'react';
import { Group, Rect, Label, Text, Circle, Arc } from "react-konva";

class PowerButton extends Component {

    constructor(props) {
        super(props);
        this.state = {
            id: 0,
            equipmentId: 0,
            on: false,
            label: "NoLabel"
        }
        this.toggleOnOff = this.toggleOnOff.bind(this);
    }

    toggleOnOff() {
        if (this.state.on === true) {
            alert('id: ' + this.state.id +  ' Toggle On->Off');
        } else {
            alert('id: ' + this.state.id +  ' Toggle Off->On');
        }
        this.setState({
            on: !this.state.on
        });
    }

    componentDidMount() {

    }


    render() {
        let pbForeColor = (this.state.on ? "yellow" : "gray");
        let pbBackColor = (this.state.on ? "#00C000" : "#C7C7C7"); // light green/light gray
        let pbLabel = this.state.label;
        return (
            <Group
                width={50}
                height={50}
                listening={true}
                onclick={() => this.toggleOnOff()}
                draggable={true}
            >
                <Rect
                    width={50}
                    height={50}
                    fill="black"
                    cornerRadius={4}
                />
                <Label x={0} y={53}>
                    <Text
                        text={pbLabel}
                        width={50}
                        align="center"
                    />
                </Label>
                <Circle
                    x={25}
                    y={25}
                    radius={20}
                    fill={pbBackColor}
                />
                <Arc
                    x={25}
                    y={25}
                    innerRadius={10}
                    outerRadius={13}
                    angle={300}
                    rotation={-59}
                    fill={pbForeColor}
                    lineCap="round"
                />
                <Rect
                    x={23}
                    y={9}
                    width={5}
                    height={18}
                    fill={pbForeColor}
                    cornerRadius={4}
                />
            </Group>
        )
    }
}
export default PowerButton;