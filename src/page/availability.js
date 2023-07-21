import React, { useState, useContext, useEffect } from "react";
import { Badge, Calendar, Modal, Space, Button, Checkbox } from 'antd';
import dayjs from 'dayjs';
import { API } from 'aws-amplify';
import { AppContext } from "./main";
import { createAvailability, deleteAvailability } from "../graphql/mutations";

const Availability = (props) => {
    const { appointments, availability } = useContext(AppContext);
    const [value, setValue] = useState(() => dayjs());
    const [selectedValue, setSelectedValue] = useState(() => dayjs());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [availabilityList, setAvailabilityList] = useState(new Array(6).fill(null));
    const [tempAvailabilityList, setTempAvailabilityList] = useState(new Array(6).fill(null));
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = async () => {
        let hasError = false;
        for (let i = 8; i < 20;) {
            const index = (i - 8) / 2;
            if (availabilityList[index] !== tempAvailabilityList[index]) {
                const selectedDateObject = selectedValue.toDate();
                const timeObject = new Date(selectedDateObject.getFullYear(), selectedDateObject.getMonth(), selectedDateObject.getDate(), i, 0, 0);
                const result = !(await changeAvailability(tempAvailabilityList[index], timeObject, getAvailabilityForDay(selectedValue, availability)));
                hasError = hasError || result;
            }
            i += 2;
        }
        if (hasError) {
            Modal.error({
                title: "Error updating some availability",
                content: "Some availability updates failed. It is possiblely due to new appointments being created. Refresh to view updated appointments and availability.",
            })
            setIsModalOpen(false);
            return;
        }
        props.loadAvailability();
        
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const onSelect = (newValue) => {
        setValue(newValue);
        setSelectedValue(newValue);
        showModal();
    };
    const onPanelChange = (newValue) => {
        setValue(newValue);
    };
    const dateCellRender = (value) => {
        const listData = getListData(value, availability);
        return (
            <ul className="events">
                {listData.map((item) => (
                    <li key={item.content}>
                        <Badge status={'warning'} text={item.content} />
                    </li>
                ))}
            </ul>
        );
    };
    const cellRender = (current, info) => {
        if (info.type === 'date') return dateCellRender(current);
        return info.originNode;
    };

    useEffect(() => {
        const valueAsDate = selectedValue.toDate();
        const appointmentForDate = Object.entries(appointments).filter((e) => sameDay(selectedValue.toDate(), new Date(e[0])))
        const availabilityForDate = availability.filter((e) => sameDay(selectedValue.toDate(), new Date(e.time)));
        const options = [];
        for (let i = 8; i <= 19;) {
            const timeObject1 = new Date(valueAsDate.getFullYear(), valueAsDate.getMonth(), valueAsDate.getDate(), i, 0, 0);
            const timeObject2 = new Date(valueAsDate.getFullYear(), valueAsDate.getMonth(), valueAsDate.getDate(), i + 2, 0, 0);
            const labelText1 = timeObject1.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
            const labelText2 = timeObject2.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
            options.push(
                {
                    value: i,
                    startTime: timeObject1,
                    label: `${labelText1} - ${labelText2}`,
                }
            )
            i += 2;
        }

        const temp = [];

        options.forEach((e, i) => {
            const isAvailablitySelected = availabilityForDate.some(item => item.time.getTime() === e.startTime.getTime());
            const isAppointmentSet = appointmentForDate.some(item => {
                const dateObject = new Date(item[0]);
                return dateObject.getTime() === e.startTime.getTime();
            })
            temp.push(isAvailablitySelected || isAppointmentSet);
        })
        setAvailabilityList(temp);
        setTempAvailabilityList(temp);
    }, [selectedValue, availability, appointments]);



    const getAppointmentForDay = (value, appointments) => Object.entries(appointments).filter((e) => sameDay(value.toDate(), new Date(e[0])));

    const getAvailabilityForDay = (value, availability) => availability.filter((e) => sameDay(value.toDate(), new Date(e.time)));

    const sameDay = (day1, day2) => day1.toLocaleDateString() === day2.toLocaleDateString();

    const renderAvailabilityForDay = (value, availability, appointments) => {
        const valueAsDate = value.toDate();
        const availabilityForDate = getAvailabilityForDay(value, availability);
        const appointmentForDate = getAppointmentForDay(value, appointments);
        const options = [];
        for (let i = 8; i <= 19;) {
            const timeObject1 = new Date(valueAsDate.getFullYear(), valueAsDate.getMonth(), valueAsDate.getDate(), i, 0, 0);
            const timeObject2 = new Date(valueAsDate.getFullYear(), valueAsDate.getMonth(), valueAsDate.getDate(), i + 2, 0, 0);
            const labelText1 = timeObject1.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
            const labelText2 = timeObject2.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
            options.push(
                {
                    value: i,
                    startTime: timeObject1,
                    label: `${labelText1} - ${labelText2}`,
                }
            )
            i += 2;
        }

        return (<Space className="appointment-space" direction="vertical">
            {
                options.map((e, i) => {
                    const isAvailablitySelected = availabilityForDate.some(item => item.time.getTime() === e.startTime.getTime());
                    const isAppointmentSet = appointmentForDate.some(item => {
                        const dateObject = new Date(item[0]);
                        return dateObject.getTime() === e.startTime.getTime();
                    })
                    return (
                        <div key={i}>
                            {<Checkbox defaultChecked={isAvailablitySelected || isAppointmentSet}
                                disabled={isAppointmentSet || isPastDate(value)} onChange={(element) => toggleAvailability(i, element)}>{e.label}</Checkbox>}
                        </div>
                    )
                })
            }
        </Space>)

    }

    const getListData = (value, availability) => {
        let listData = [];
        const availabilityForDate = getAvailabilityForDay(value, availability);

        availabilityForDate.forEach(e => {
            listData.push({
                content: getAvailabilityLabel(e)
            })
        })


        return listData || [];
    };

    const getAvailabilityLabel = (e) => {
        const startDateObject = new Date(e.time);
        const endDateObject = new Date(startDateObject);
        endDateObject.setHours(startDateObject.getHours() + 2, 0, 0, 0);
        const startTime = startDateObject.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        const endTime = endDateObject.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        return `${startTime} - ${endTime}`;
    }

    const toggleAvailability = (index, e) => {
        const isChecked = e.target.checked;
        const temp = [...tempAvailabilityList];
        temp[index] = isChecked;
        setTempAvailabilityList(temp);
    }

    const changeAvailability = async (isChecked, time, availabilityForDate) => {
        if (isChecked) {
            return await addAvailability(time);
        } else {
            return await removeAvailability(time, availabilityForDate);
        }
    }

    const addAvailability = async (time) => {
        try {
            await API.graphql({
                query: createAvailability,
                variables: {
                    input: {
                        time: time.getTime(),
                    }
                },
            });
        } catch {
            return false;
        }
        return true;
    }

    const removeAvailability = async (time, availabilityForDate) => {


        const availabilityToBeRemoved = availabilityForDate.find(e => e.time.getTime() === time.getTime())
        const id = availabilityToBeRemoved.id;
        const result = await API.graphql({
            query: deleteAvailability,
            variables: {
                input: { id },
            },
        });

        if (result.data.deleteAvailability === null) {
            return false;
        }
        return true;

    }

    const isPastDate = (current) => {
        const currentDate = current.toDate().setHours(0, 0, 0, 0);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        return currentDate < todayDate;
    }

    return <>
        <Calendar cellRender={cellRender} value={value} onSelect={onSelect} onPanelChange={onPanelChange} />
        <Modal title={selectedValue.toDate().toLocaleDateString()} open={isModalOpen} onOk={handleOk} onCancel={handleCancel} destroyOnClose={true}
            footer={[
                <Button key="back" onClick={handleCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={handleOk}>
                    Save
                </Button>]}>
            {renderAvailabilityForDay(value, availability, appointments)}
        </Modal>
    </>
};

export default Availability;