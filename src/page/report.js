import React, { useState, useContext } from "react";
import { DatePicker, Button, Space, Modal, Card, Typography, Divider, Table } from 'antd';
import { AppContext } from "./main";
import '../css/search.scss';

const Report = (props) => {
    const { Title } = Typography;
    const { appointments, isAdmin } = useContext(AppContext);
    const [month, setMonth] = useState();
    const [year, setYear] = useState();
    const [monthSearchResult, setMonthSearchResult] = useState([]);
    const [yearSearchResult, setYearSearchResult] = useState([]);

    const onMonthPickerChange = (date) => {
        setMonth(date);
        setMonthSearchResult([]);
    }

    const onYearPickerChange = (date) => {
        setYear(date);
        setYearSearchResult([]);
    }

    const monthColumns = [
        {
            title: "Client",
            dataIndex: "client",
            key: "client"
        },
        {
            title: "Hours",
            dataIndex: "hour",
            key: "hour"
        },
        {
            title: "Most Recent Appointment",
            dataIndex: "latest",
            key: "latest",
        }
    ]

    const yearColumns = [
        {
            title: "Month",
            dataIndex: "month",
            key: "month"
        },
        {
            title: "Hours",
            dataIndex: "hour",
            key: "hour"
        }
    ]


    const queryMonth = () => {
        if (!month) {
            Modal.error({
                title: "No month selected",
                content: "Select a month.",
            })
            setMonthSearchResult([]);
            return;
        }
        const monthDateObject = month.toDate();

        const firstDay = new Date(monthDateObject.getFullYear(), monthDateObject.getMonth(), 1);
        const lastDay = new Date(monthDateObject.getFullYear(), monthDateObject.getMonth() + 1, 0);
        lastDay.setHours(23, 59, 59, 999);

        const queryResult = Object.entries(appointments).filter((appointment) => {
            const appointmentTime = appointment[0];
            const e = new Date(appointmentTime);
            return e.getTime() <= lastDay.getTime() && e.getTime() >= firstDay.getTime();
        });
        const totalHours = queryResult.length;
        const mappedResult = queryResult.map(e => {
            const appointmentUser = e[1][1];
            return appointmentUser;
        }).reduce((a, c) => {
            return (a[c] ? ++ a[c] : a[c] = 1 , a)
          }, {});
        const result = Object.entries(mappedResult).map((e, i) => {
            const mostRecentAppointmentTime = queryResult.findLast((ele) => ele[1][1] === e[0])[0];
            const timeObject = new Date(mostRecentAppointmentTime);
            return {
                key: i,
                client: e[0],
                hour: e[1],
                latest: timeObject.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
            }
        })

        result.push(
            {
                key: result.length,
                client: "Total",
                hour: totalHours,
                latest: null
            }
        )
        setMonthSearchResult(result);
        setYearSearchResult([]);
    }

    const queryYear = () => {
        if (!year) {
            Modal.error({
                title: "No year selected",
                content: "Select a year.",
            })
            setMonthSearchResult([]);
            return;
        }
        const yearDateObject = year.toDate();

        const firstDay = new Date(yearDateObject.getFullYear(), 0, 1);
        const lastDay = new Date(yearDateObject.getFullYear(), 11, 31);
        lastDay.setHours(23, 59, 59, 999);

        const queryResult = Object.entries(appointments).filter((appointment) => {
            const appointmentTime = appointment[0];
            const e = new Date(appointmentTime);
            return e.getTime() <= lastDay.getTime() && e.getTime() >= firstDay.getTime();
        });
        const totalHours = queryResult.length;
        const mappedResult = queryResult.map(e => {
            const appointmentTime = new Date(e[0]);
            const appointmentMonth = appointmentTime.getMonth();
            return appointmentMonth;
        }).reduce((a, c) => {
            return (a[c] ? ++ a[c] : a[c] = 1 , a)
          }, {});
        const result = Object.entries(mappedResult).map((e, i) => {
            const dateObject = new Date();
            dateObject.setMonth(e[0]);
          
            const monthName = dateObject.toLocaleString('default', { month: 'long' });
            return {
                key: i,
                month: monthName,
                hour: e[1],
            }
        })

        result.push(
            {
                key: result.length,
                month: "Total",
                hour: totalHours,
            }
        )
        setYearSearchResult(result);
        setMonthSearchResult([]);
    }
    return (
        <Space direction="vertical" style={{ paddingLeft: '40px' }}>
            <Title level={2}>Generate appointment report</Title>
            {
                isAdmin && (
                    <>
                        <Title level={3}>For Month</Title>
                        <Space direction="horizontal">
                            <Title level={4}>Select a month:</Title>
                            <DatePicker style={{ width: 150 }} onChange={onMonthPickerChange} picker="month" />
                        </Space>
                        <Button onClick={() => queryMonth()}>Create Report</Button>
                        <Divider />
                    </>
                )
            }
            <Title level={3}>For Year</Title>
            <Space direction="horizontal">
                <Title level={4}>Select a year:</Title>
                <DatePicker style={{ width: 150 }} onChange={onYearPickerChange} picker="year" />
            </Space>
            <Button onClick={() => queryYear()}>Create Report</Button>
            {monthSearchResult.length > 0 &&
                <Card style={{ marginBottom: '20px', marginRight: '40px' }}>
                    <Title level={4}>Appointment Report For {`${month.toDate().toLocaleString('default', { month: 'short' })}, ${month.toDate().getFullYear()}`}</Title>
                    <Title level={5}>Created at: {(new Date()).toLocaleString()}</Title>
                    <Table dataSource={monthSearchResult} columns={monthColumns} />
                </Card>}
            {yearSearchResult.length > 0 &&
            <Card style={{ marginBottom: '20px', marginRight: '40px' }}>
                <Title level={4}>Appointment Report For {year.toDate().getFullYear()}</Title>
                <Title level={5}>Created at: {(new Date()).toLocaleString()}</Title>
                <Table dataSource={yearSearchResult} columns={yearColumns} />
            </Card>}
        </Space>
    );
};

export default Report;