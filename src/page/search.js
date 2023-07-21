import React, { useState, useContext } from "react";
import { DatePicker, Button, Space, Modal, TimePicker, Card, Typography } from 'antd';
import { AppContext } from "./main";
import '../css/search.scss';

const Search = (props) => {
    const { Title } = Typography;
    const { username, appointments } = useContext(AppContext);
    const [startDate, setStartDate] = useState();
    const [startTime, setStartTime] = useState();
    const [endDate, setEndDate] = useState();
    const [endTime, setEndTime] = useState();
    const [searchResult, setSearchResult] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const onStartDateChange = (date) => {
        setStartDate(date);
    };

    const onStartTimeChange = (time) => {
        setStartTime(time);
    }

    const onEndDateChange = (date) => {
        setEndDate(date);
    };

    const onEndTimeChange = (time) => {
        setEndTime(time);
    }

    const query = () => {
        if (!startDate || !startTime || !endDate || !endTime) {
            Modal.error({
                title: "Some fields are blank",
                content: "Fill in all the fields.",
            })
            setSearchResult([]);
            setHasSearched(false);
            return;
        }
        const startDateObject = startDate.toDate();
        const startTimeObject = startTime.toDate();
        const endDateObject = endDate.toDate();
        const endTimeObject = endTime.toDate();

        startDateObject.setHours(startTimeObject.getHours(), startTimeObject.getMinutes(), startTimeObject.getSeconds());

        endDateObject.setHours(endTimeObject.getHours(), endTimeObject.getMinutes(), endTimeObject.getSeconds());

        if (endDateObject.getTime() < startDateObject.getTime()) {
            Modal.error({
                title: "Invalid range",
                content: "End time cannot be before start time.",
            })
            setSearchResult([]);
            setHasSearched(false);
        }
        const result = Object.entries(appointments).filter((appointment) => {
            const appointmentTime = appointment[0];
            const e = new Date(appointmentTime);
            return e.getTime() <= endDateObject.getTime() && e.getTime() >= startDateObject.getTime();
        }).map(e => {
            const appointmentTime = e[0];
            const appointmentUser = e[1][1];
            const start = new Date(appointmentTime);
            const end = new Date(start);
            end.setHours(start.getHours() + 2, 0, 0, 0);
            let output = `Time: ${start.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })} - ${end.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}`;
            if (username === 'admin') output = 'Client: ' + appointmentUser + ' | ' + output;
            return output;
        })
        setSearchResult(result);
        setHasSearched(true);
    }
    return (
        <Space direction="vertical" style={{ paddingLeft: '40px' }}>
            <Title level={2}>View appointments for below time period</Title>
            <Title level={3}>Start</Title>
            <Space direction="horizontal">
                <Title level={4}>Select a date:</Title>
                <DatePicker style={{ width: 150 }} onChange={onStartDateChange} />
            </Space>
            <Space direction="horizontal">
                <Title level={4}>Select a time:</Title>
                <TimePicker use12Hours format="h:mm A" onChange={onStartTimeChange} />
            </Space>
            <Title level={3}>End</Title>
            <Space direction="horizontal">
                <Title level={4}>Select a date:</Title>
            <DatePicker style={{ width: 150 }} onChange={onEndDateChange} />
            </Space>
            <Space direction="horizontal">
                <Title level={4}>Select a time:</Title>
            <TimePicker use12Hours format="h:mm A" onChange={onEndTimeChange} />
            </Space>

            <Button onClick={() => query()}>View</Button>
            {searchResult.length > 0 &&
                <Card style={{marginBottom: '20px', marginRight: '40px'}}>
                    <Title level={4}>Total: {searchResult.length}</Title>
                    <ul>
                        {searchResult.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                </Card>}
            {(searchResult.length === 0 && hasSearched) && <Title level={4}>No result</Title>}
        </Space>
    );
};

export default Search;