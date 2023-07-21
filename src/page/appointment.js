import React, { useState, useContext } from "react";
import { DatePicker, Select, Button, Space, Modal, Typography, Input, Checkbox } from 'antd';
import { API } from 'aws-amplify';
import { AppContext } from "./main";
import { createAppointment, createAvailability, deleteAvailability, updateAppointment } from "../graphql/mutations";
import { getAppointment } from '../graphql/queries';

const Appointment = (props) => {
    const { Title } = Typography;
    const { TextArea } = Input;
    const { username, availability, userEmail } = useContext(AppContext);
    const [selectedDate, setSelectedDate] = useState(props.preSelectedDate);
    const [selectedTime, setSelectedTime] = useState();
    const [selectedAppointmentLength, setSelectedAppointmentLength] = useState(props.isUpdate ? props.details[1][2] || '' : '');
    const [additionalNote, setAdditionalNote] = useState(props.isUpdate? props.details[1][3] || '' : '');
    const [keepCurrentTime, setKeepCurrentTime] = useState(props.isUpdate);
    const [isUpdateSameDay, setIsUpdateSameDay] = useState(true);
    const onDateChange = (date, dateString) => {
        setSelectedDate(date);
        if (props.isUpdate) {
            const isUpdateOnSameDay = date.toDate().getTime() === props.editDate.getTime()
            setIsUpdateSameDay(isUpdateOnSameDay);
            setKeepCurrentTime(isUpdateOnSameDay);
        }
    };

    const isDateDisabled = (current) => {
        const currentDate = current.toDate().setHours(0, 0, 0, 0);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        return currentDate < todayDate;
    }
    const handleChange = (value) => {
        setSelectedTime(value);
    }
    const handleChangeLength = (value) => {
        setSelectedAppointmentLength(value);
    }
    const isTimeAvailable = (hour) => {
        if (!selectedDate) return false;
        const currentDate = selectedDate.toDate();
        currentDate.setHours(hour, 0, 0, 0);
        return availability.some(e => e.time.getTime() === currentDate.getTime());
    }
    const options = [];
    for (let i = 8; i <= 19;) {
        const timeObject1 = new Date(2023, 0, 1, i, 0, 0);
        const timeObject2 = new Date(2023, 0, 1, i + 2, 0, 0);
        const labelText1 = timeObject1.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        const labelText2 = timeObject2.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        options.push(
            {
                value: i,
                label: `${labelText1} - ${labelText2}`,
                disabled: !isTimeAvailable(i)
            }
        )
        i += 2;
    }
    const generateAppointment = async (availability, selectedDate, selectedTime) => {
        if (!selectedTime || !selectedDate || !selectedAppointmentLength) {
            Modal.error({
                title: "No date, time, or appointment length selected",
                content: "Select a date slot, a time slot, and an appointment length. If no time slot is available for this date, try a different day.",
            })
            return;
        }

        const newAppointmentTime = selectedDate.toDate();
        newAppointmentTime.setHours(selectedTime, 0, 0, 0);
        try {
            const availabilityToBeRemoved = availability.find(e => e.time.getTime() === newAppointmentTime.getTime())
            const id = availabilityToBeRemoved.id;
            const deleteResult = await API.graphql({
                query: deleteAvailability,
                variables: {
                    input: { id },
                },
            });
            if (deleteResult.data.deleteAvailability === null) {
                Modal.error({
                    title: "Error creating appointment",
                    content: "This time slot is no longer available. Refresh to view available time slots.",
                })
                return;
            }
            await API.graphql({
                query: createAppointment,
                variables: {
                    input: {
                        client: username,
                        time: newAppointmentTime.getTime(),
                        type: selectedAppointmentLength,
                        note: additionalNote,
                        email: userEmail,
                    }
                },
            });
            props.loadAvailability();
            props.loadAppointments();

            props.setCurrent('schedule');
        } catch {
            Modal.error({
                title: "Error creating appointment",
                content: "This time slot might already be taken. Refresh and try again.",
            });
            return;
        }

    }
    const editAppointment = async (availability, selectedDate, selectedTime) => {
        if (!selectedDate || (!keepCurrentTime && !selectedTime)) {
            Modal.error({
                title: "No date or time selected",
                content: "Select a date and a time slot. If no time slot is available for this date, try a different day.",
            })
            return;
        }

        const newAppointmentTime = selectedDate.toDate();
        newAppointmentTime.setHours(selectedTime, 0, 0, 0);

        const currentAppointment = await API.graphql({
            query: getAppointment,
            variables: {
                id: props.editId
            }
        })

        if (currentAppointment.data.getAppointment.time !== props.editDate.getTime()) {
            Modal.error({
                title: "Error updating appointment",
                content: "This appointment has been updated. Refresh to view schedule.",
            })
            return;
        }



        if (keepCurrentTime) {
            const result = await API.graphql({
                query: updateAppointment,
                variables: {
                    input: {
                        id: props.editId,
                        client: username,
                        time: props.editDate.getTime(),
                        type: selectedAppointmentLength,
                        note: additionalNote,
                        email: userEmail,
                    }
                },
            });
            if (result.data.updateAppointment === null) {
                Modal.error({
                    title: "Error updating appointment",
                    content: "This appointment has already been cancelled. Refresh to view schedule.",
                })
                return
            }
            props.loadAppointments();
        } else {

            const availabilityToBeRemoved = availability.find(e => e.time.getTime() === newAppointmentTime.getTime())
            const id = availabilityToBeRemoved.id;
            const deleteResult = await API.graphql({
                query: deleteAvailability,
                variables: {
                    input: { id },
                },
            });
            if (deleteResult.data.deleteAvailability === null) {
                Modal.error({
                    title: "Error creating appointment",
                    content: "This time slot is no longer available. Refresh to view available time slots.",
                })
                return;
            }
            const result = await API.graphql({
                query: updateAppointment,
                variables: {
                    input: {
                        id: props.editId,
                        client: username,
                        time: newAppointmentTime.getTime(),
                        type: selectedAppointmentLength,
                        note: additionalNote,
                        email: userEmail,
                    }
                },
            });
            if (result.data.updateAppointment === null) {
                Modal.error({
                    title: "Error updating appointment",
                    content: "This appointment has already been cancelled. Refresh to view schedule.",
                })
                await API.graphql({
                    query: createAvailability,
                    variables: {
                        input: {
                            time: newAppointmentTime.getTime(),
                        }
                    },
                });
                return;
            }

            await API.graphql({
                query: createAvailability,
                variables: {
                    input: {
                        time: props.editDate.getTime(),
                    }
                },
            });

            props.loadAvailability();

            props.loadAppointments();


        }

        props.handleEditOk();


    }

    return (
        <Space direction="vertical" style={{ paddingLeft: '40px' }}>
            {props.isUpdate && <><Title level={4}>Current appointment: {props.editDate.toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</Title><Title level={4}>New appointment:</Title></>}
            {!props.isUpdate && <Title level={4}>Create a new appointment</Title>}
            <Space direction="horizontal">
                <Title level={4}>Select a date:</Title>
                <DatePicker style={{ width: 170 }} defaultValue={props.preSelectedDate} onChange={onDateChange} disabledDate={isDateDisabled} />
            </Space>

            {props.isUpdate && isUpdateSameDay && <Title level={4}>Keep current time <Checkbox defaultChecked={true} onChange={(e) => setKeepCurrentTime(e.target.checked)}></Checkbox></Title>}
            {
                (!props.isUpdate || !keepCurrentTime) &&
                <Space direction="horizontal">
                    <Title level={4}>Select a time:</Title>
                    <Select
                        style={{
                            width: 170,
                        }}
                        onChange={handleChange}
                        options={options}
                    />
                </Space>
            }

            <Space direction="horizontal">
                <Title level={4}>Appointment length:</Title>
                <Select
                    value={selectedAppointmentLength}
                    style={{
                        width: 170,
                    }}
                    onChange={handleChangeLength}
                    options={[
                        {
                            value: '60',
                            label: '1 Hour',
                        },
                        {
                            value: '90',
                            label: '90 Minutes',
                        }
                    ]}
                />
            </Space>
            <Space direction="vertical">
                <Title level={4}>Additional notes (optional):</Title>
                <TextArea value={additionalNote} row="4" placeholder="Notes" style={{ width: 300 }} onChange={(e) => setAdditionalNote(e.target.value)} />
            </Space>
            {props.isUpdate
                ? <Button onClick={() => editAppointment(availability, selectedDate, selectedTime)}>Update</Button>
                : <Button onClick={() => generateAppointment(availability, selectedDate, selectedTime)}>Create</Button>}
        </Space>
    );
};

export default Appointment;