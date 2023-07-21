import React, { useState, useContext } from "react";
import { Badge, Calendar, Modal, Card, Space, Button } from 'antd';
import dayjs from 'dayjs';
import { API } from 'aws-amplify';
import { AppContext } from "./main";
import { deleteAppointment, createAvailability } from "../graphql/mutations";
import { getAppointment } from "../graphql/queries";
import { ExclamationCircleFilled } from '@ant-design/icons';
import '../css/schedule.scss';
import Appointment from "./appointment";

const Schedule = (props) => {
    const typeMap = {
        '90' : '90 Minutes',
        '60' : '1 Hour',
    }
    const { isAdmin, appointments } = useContext(AppContext);
    const [value, setValue] = useState(() => dayjs());
    const [selectedValue, setSelectedValue] = useState(() => dayjs());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [details, setDetails] = useState([[], []]);
    const [editId, setEditId] = useState('');
    const [editDate, setEditDate] = useState(new Date());
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const showEdit = () => {
        setIsEditOpen(true);
    }
    const onSelect = (newValue) => {
        setValue(newValue);
        setSelectedValue(newValue);
        props.setPreSelectedDate(newValue);
        showModal();
    };
    const onPanelChange = (newValue) => {
        setValue(newValue);
    };

    const { confirm } = Modal;

    const confirmCancelAppointment = (date) => {
        confirm({
            title: 'Cancel Appointment',
            icon: <ExclamationCircleFilled />,
            content: 'Are you sure you want to cancel this appointment?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                cancelAppointment(date);
            },
            onCancel() {

            },
        });
    };

    const dateCellRender = (value) => {
        const listData = getListData(value, appointments);
        return (
            <ul className="events">
                {listData.map((item) => (
                    <li key={item.content}>
                        <Badge status={'success'} text={item.content} />
                    </li>
                ))}
            </ul>
        );
    };
    const cellRender = (current, info) => {
        if (info.type === 'date') return dateCellRender(current);
        return info.originNode;
    };

    const getListData = (value, appointments) => {
        let listData = [];
        const appointmentForDate = getAppointmentForDay(value, appointments);
        if (appointmentForDate.length === 0) return [];
        appointmentForDate.forEach(e => {
            listData.push({
                content: getAppointmentTime(e[0])
            })

        })

        return listData || [];
    };

    const getAppointmentForDay = (value, appointments) => Object.entries(appointments).filter((e) => sameDay(value.toDate(), new Date(e[0])));

    const sameDay = (day1, day2) => day1.toLocaleDateString() === day2.toLocaleDateString();

    const getAppointmentTime = (date) => {
        const startDateObject = new Date(date);
        const endDateObject = new Date(startDateObject);
        endDateObject.setHours(startDateObject.getHours() + 2, 0, 0, 0);
        const startTime = startDateObject.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        const endTime = endDateObject.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        return `${startTime} - ${endTime}`;
    }

    const cancelAppointment = async (date) => {
        const id = date[1][0];
        const startDateObject = new Date(date[0]);

        const currentAppointment = await API.graphql({
            query: getAppointment,
            variables: {
                id: id
            }
        })

        if (!currentAppointment.data.getAppointment || currentAppointment.data.getAppointment.time !== startDateObject.getTime()) {
            Modal.error({
                title: "Error cancelling appointment",
                content: "This appointment has been updated. Refresh to view schedule.",
            })
            return;
        }


        const deleteResult = await API.graphql({
            query: deleteAppointment,
            variables: {
                input: { id },
            },
        });
        if (deleteResult.data.deleteAppointment === null) {
            Modal.error({
                title: "Error cancelling appointment",
                content: "This appointment has already been cancelled. Refresh to view schedule.",
            })
            return;
        }

        await API.graphql({
            query: createAvailability,
            variables: {
                input: {
                    time: startDateObject.getTime(),
                }
            },
        });

        props.loadAppointments();
        props.loadAvailability();
        setIsDetailOpen(false);
    }

    const isPastDate = (current) => {
        const currentDate = current.toDate().setHours(0, 0, 0, 0);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        return currentDate < todayDate;
    }

    const editAppointment = (date) => {
        const id = date[1][0];
        const startDateObject = new Date(date[0]);
        setEditId(id);
        setEditDate(startDateObject);
        handleCancel();
        setIsDetailOpen(false);
        showEdit();
    }

    const renderAppointmentsForDay = (value, appointments) => {
        const selectedDayAppointments = getAppointmentForDay(value, appointments);
        return (<Space className="appointment-space" direction="vertical">
            {selectedDayAppointments.length > 0
                ? selectedDayAppointments.map((e, i) =>
                    <Card className="appointment-card" key={i}>
                        <span>Time: {getAppointmentTime(e[0])}</span>
                        <Button onClick={() => {
                            setDetails(e);
                            setIsDetailOpen(true);
                        }}>Details</Button>
                    </Card>)
                : <div className="no-appointment"><span>No appointments</span></div>}
            {(!isPastDate(value) && !isAdmin) && <Button onClick={() => props.setCurrent('appointment')}>Create Appointment</Button>}
        </Space>)
    }

    return <>
        <Calendar cellRender={cellRender} value={value} onSelect={onSelect} onPanelChange={onPanelChange} />
        <Modal title={selectedValue.toDate().toLocaleDateString()} open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={null}>
            {renderAppointmentsForDay(value, appointments)}
        </Modal>
        <Modal title={'Edit Appointment'} open={isEditOpen} onCancel={() => setIsEditOpen(false)} footer={null} destroyOnClose={true} >
            <Appointment preSelectedDate={() => dayjs(editDate)} isUpdate={true} editId={editId} editDate={editDate} handleEditOk={() => setIsEditOpen(false)} details={details} loadAvailability={props.loadAvailability} loadAppointments={props.loadAppointments} />
        </Modal>
        <Modal title={'Appointment Detail'} open={isDetailOpen} onCancel={() => setIsDetailOpen(false)} footer={[
            !isPastDate(value) && !isAdmin && <Button key='edit-btn' onClick={() => editAppointment(details)}>Edit</Button>,
            !isPastDate(value) && <Button key='cancel-bth' onClick={() => confirmCancelAppointment(details)}>Cancel</Button>
        ]} destroyOnClose={true} >
            <Space key={'space-0'} direction="vertical">
                {isAdmin && <span key='span-client-name'>Client name: {details[1][1]}</span>}
                <span key='span-appointment-length'>Appointment length: {typeMap[details[1][2]] || ' '}</span>
                <span key='span-additional-notes'>Additional notes: {details[1][3]}</span>
            </Space>
        </Modal>
    </>
};

export default Schedule;