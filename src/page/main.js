import React, { useState, createContext, useEffect } from 'react';
import { CalendarOutlined, FormOutlined, ReloadOutlined, LogoutOutlined, SearchOutlined, SnippetsOutlined, SmileOutlined } from '@ant-design/icons';
import { Menu, Spin } from 'antd';
import dayjs from 'dayjs';
import { API, Auth } from 'aws-amplify';
import Schedule from './schedule';
import Appointment from './appointment';
import Search from './search';
import Report from './report';
import Availability from './availability';
import { listAppointments, listAvailabilities } from '../graphql/queries';
import '../css/main.scss';

export const AppContext = createContext();

const Main = (props) => {

    const [menuItems, setMenuItems] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [username, setUsername] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [appointments, setAppointments] = useState({});
    const [availability, setAvailability] = useState([]);
    const [current, setCurrent] = useState('schedule');

    const [preSelectedDate, setPreSelectedDate] = useState(() => dayjs());


    useEffect(() => {
        loadData();
    }, [])


    const loadData = async () => {
        const user = await Auth.currentAuthenticatedUser();
        const currentUsername = user.username;
        const currentUserEmail = user?.attributes?.email || '';
        console.log(user)
        setUsername(currentUsername);
        setUserEmail(currentUserEmail);
        const cognitoGroup = user?.signInUserSession?.accessToken?.payload['cognito:groups'] || [];
        const isCurrentUserAdmin = cognitoGroup.includes('Admin');
        setIsAdmin(isCurrentUserAdmin);
        const defaultMenuItems = [
            {
                label: currentUsername,
                key: 'username',
                icon: <SmileOutlined />,
                disabled: true,
            },
            {
                label: 'View Schedule',
                key: 'schedule',
                icon: <CalendarOutlined />,
            },
            {
                label: 'Search',
                key: 'search',
                icon: <SearchOutlined />,
            },
            {
                label: 'Report',
                key: 'report',
                icon: <SnippetsOutlined />,
            },
            {
                label: 'Refresh',
                key: 'refresh',
                icon: <ReloadOutlined />,
            },
            {
                label: 'Logout',
                key: 'logout',
                icon: <LogoutOutlined />,
            },
        ];
        const newMenuItem = isCurrentUserAdmin
            ?
            {
                label: 'View Availability',
                key: 'availability',
                icon: <FormOutlined />,
            }
            :
            {
                label: 'Create Appointment',
                key: 'appointment',
                icon: <FormOutlined />,
            };
        defaultMenuItems.splice(2, 0, newMenuItem);
        setMenuItems(defaultMenuItems);
        const appointmentQuery = isCurrentUserAdmin
            ? {
                query: listAppointments,
            }
            : {
                query: listAppointments,
                variables: {
                    filter: {
                        client: {
                            eq: currentUsername
                        }
                    }
                }
            };
        const appointmentApiData = await API.graphql(appointmentQuery);
        const appointmentsFromAPI = appointmentApiData.data.listAppointments.items;
        const temp = {};
        appointmentsFromAPI.forEach((e) => {
            const dateObject = new Date(e.time);
            temp[dateObject] = [e.id, e.client, e.type, e.note, e.email]
        })
        const sortedAppointments = Object.keys(temp).sort().reduce(
            (obj, key) => {
                obj[key] = temp[key];
                return obj;
            },
            {}
        );
        setAppointments(sortedAppointments);

        const availabilityQuery = {
            query: listAvailabilities,
        }
        const availabilityApiData = await API.graphql(availabilityQuery);
        const availabilityFromAPI = availabilityApiData.data.listAvailabilities.items.map(e => {
            return {
                time: new Date(e.time),
                id: e.id,
            }
        });

        availabilityFromAPI.sort((a, b) => a.time - b.time);

        setAvailability(availabilityFromAPI);


        setDataLoaded(true);
    }

    const loadAvailability = async () => {
        const availabilityQuery = {
            query: listAvailabilities,
        }
        const availabilityApiData = await API.graphql(availabilityQuery);
        const availabilityFromAPI = availabilityApiData.data.listAvailabilities.items.map(e => {
            return {
                time: new Date(e.time),
                id: e.id,
            }
        });

        availabilityFromAPI.sort((a, b) => a.time - b.time);

        setAvailability(availabilityFromAPI);
    }

    const loadAppointments = async () => {
        const appointmentQuery = isAdmin
            ? {
                query: listAppointments,
            }
            : {
                query: listAppointments,
                variables: {
                    filter: {
                        client: {
                            eq: username
                        }
                    }
                }
            };
        const appointmentApiData = await API.graphql(appointmentQuery);
        const appointmentsFromAPI = appointmentApiData.data.listAppointments.items;
        const temp = {};
        appointmentsFromAPI.forEach((e) => {
            const dateObject = new Date(e.time);
            temp[dateObject] = [e.id, e.client, e.type, e.note, e.email];
        })
        const sortedAppointments = Object.keys(temp).sort().reduce(
            (obj, key) => {
                obj[key] = temp[key];
                return obj;
            },
            {}
        );
        setAppointments(sortedAppointments);
    }

    const onClick = (e) => {
        setCurrent(e.key);
        if (e.key === 'logout') {
            props.signOut();
        }
        if (e.key === 'refresh') {
            window.location.reload();
        }
    };

    return (dataLoaded ? <AppContext.Provider value={{ username, userEmail, isAdmin, appointments, availability, setAppointments, setAvailability }}>
        <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={menuItems} style={{ color: '#3B0404', backgroundColor: '#DB8780' }} />
        {
            current === 'schedule' ? <Schedule setCurrent={setCurrent} setPreSelectedDate={setPreSelectedDate} loadAvailability={loadAvailability} loadAppointments={loadAppointments} /> :
                current === 'appointment' ? <Appointment setCurrent={setCurrent} preSelectedDate={preSelectedDate} isUpdate={false} loadAvailability={loadAvailability} loadAppointments={loadAppointments} /> :
                    current === 'availability' ? <Availability setCurrent={setCurrent} loadAvailability={loadAvailability} /> :
                        current === 'search' ? <Search /> :
                            current === 'report' ? <Report /> :
                                <Schedule />
        }
    </AppContext.Provider>
        : <Spin tip="Loading" size="large">
            <div className="loading" />
        </Spin>);
};

export default Main;