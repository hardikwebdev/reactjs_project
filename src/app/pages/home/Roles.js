/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { createRef } from "react";
import { Table } from "react-bootstrap";
import { connect } from "react-redux";
import {
    Portlet,
    PortletBody
} from "../../partials/content/Portlet";
import { Formik } from "formik";
import clsx from "clsx";
import {
    Button,
    Dropdown,
    Modal,
    OverlayTrigger,
    Tooltip,
    Form,
    Col
} from "react-bootstrap";
import { getRoleList, addRole, editRole, deleteRole } from "../../crud/auth.crud";
import { TitleComponent } from "../FormComponents/TitleComponent";
import Pagination from 'react-js-pagination';
import { BrandingWatermark } from '@material-ui/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { paginationTexts } from '../../../_metronic/utils/utils';
import { CircularProgress } from '@material-ui/core';

var pwdValid = /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/;
var space = /\s/;

class Roles extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            roleData: [],
            roleCount: 0,
            startDate: null,
            endDate: null,
            showAlert: false,
            loading: false,
            searchValue: "",
            limit: 25,
            status: "",
            sortBy: 'createdAt',
            sortOrder: 'DESC',
            activePage: 1,
            isFocus: false,
            show: false,
            modalType: "",
            currentRole: null,
            validated: false,
            disabledBtn: false,
            activeTab: 0,
        };
        this.inputRef = createRef();

    }


    componentDidMount = async () => {
        this.getRoleList();
    }

    getRoleList = async (searchData) => {
        this.setState({ loading: true });

        const { authToken } = this.props;

        var limitV = this.state.limit;
        var sortByV = this.state.sortBy;
        var sortOrderV = this.state.sortOrder;
        var activePage = this.state.activePage;
        var status = (this.state.status === 0 || this.state.status === 1) ? this.state.status : null;
        var search = (this.state.searchValue !== undefined) ? this.state.searchValue : null; //searchData !== undefined ? searchData : null;
        await getRoleList(authToken, search, limitV, sortByV,
            sortOrderV, activePage, status).then(result => {
                this.setState({
                    loading: false,
                    roleData: result.data.payload ? result.data.payload.data.rows : [],
                    roleCount: result.data.payload && result.data.payload.data.count
                });

            }).catch(err => {
                this.setState({
                    loading: false,
                    roleData: [],
                    roleCount: 0
                });
                if (err.response && (err.response.data.message === "jwt expired")) {
                    window.location.href = "/admin/logout";
                }
            });
    }

    clear = () => {
        this.setState({ searchValue: "" });
        setTimeout(() => {
            this.getRoleList();
        }, 500);
    };

    handleSearchChange = event => {
        this.setState({ searchValue: event.target.value });
        if (event.target.value.length === 0) {
            this.getRoleList();
        }
    };

    handleStatus = (value) => {
        this.setState({ status: value });
        setTimeout(() => {
            this.getRoleList();
        }, 500);
    }

    handleSorting = (sortBy, sortOrder) => {
        this.setState({
            sortBy: sortBy,
            sortOrder: sortOrder,
        });
        setTimeout(() => {
            this.getRoleList();
        }, 500);
    }

    handleSelect = (number) => {
        this.setState({ activePage: number });
        setTimeout(() => {
            this.getRoleList();
        }, 500);
    }

    handleModal = (value, currentRole) => {
        this.setState({ modalType: value, show: true, currentRole });
    }

    handleClose = () => {
        this.setState({ show: false, disabledBtn: false });
    }

    changeFocus = () => {
        this.setState({ isFocus: true });
    }

    handleShow = (e) => {
        this.setState({
            show: true,
        });
    }

    handleSwitchChange = async (value, item) => {
        const { authToken } = this.props;
        const { currentRole } = this.state;
        var data = {
            id: currentRole.id,
            name: currentRole.name,
            status: !currentRole.status,
            type: "updateStatus"
        }
        await editRole(authToken, data).then(result => {
            toast.success(result.data.message, {
                className: "green-css"
            });
            this.handleClose();
        }).catch(err => {
            var msg = err.response ? err.response.data.message : err.message;
            toast.error(msg, {
                className: "red-css"
            });
        });
        setTimeout(() => {
            this.getRoleList();
        }, 500);
    }

    handleChange = (key, value) => {
        this.setState({ [key]: value });
    }

    handleSubmit = () => {
        this.setState({ activePage: 1 });
        setTimeout(() => {
            this.getRoleList();
        }, 500);
    }

    handleReset = () => {
        window.location.reload();
    }

    handleEditRoleSubmit = async (values, setSubmitting, key) => {
        const { authToken } = this.props;
        var data = {
            id: this.state.currentRole.id,
        }
        data = {
            ...data, name: values.name.trim(),
        }

        await editRole(authToken, data).then(result => {
            setSubmitting(false);
            this.handleClose();
            toast.success(result.data.message, {
                className: "green-css"
            });
        }).catch(err => {
            setSubmitting(false);
            this.handleClose();
            var msg = err.response ? err.response.data.message : err.message;
            toast.error(msg, {
                className: "red-css"
            });
        });
        setTimeout(() => {
            this.getRoleList();
        }, 500);
    }

    handleAddRoleSubmit = async (values, setSubmitting) => {
        const { authToken } = this.props;
        var data = {
            name: values.name.trim()
        }
        await addRole(authToken, data).then(result => {
            setSubmitting(false);
            this.handleClose();
            toast.success(result.data.message, {
                className: "green-css"
            });
        }).catch(err => {
            setSubmitting(false);
            this.handleClose();
            var msg = err.response ? err.response.data.message : err.message;
            toast.error(msg, {
                className: "red-css"
            });
        });
        setTimeout(() => {
            this.getRoleList();
        }, 500);
    }

    handleDelete = async (event) => {
        this.setState({ disabledBtn: true });
        const { authToken } = this.props;
        var data = {
            id: this.state.currentRole.id
        }
        await deleteRole(authToken, data).then(result => {
            this.handleClose();
            toast.success(result.data.message, {
                className: "green-css"
            });
        }).catch(err => {
            this.handleClose();
            var msg = err.response ? err.response.data.message : err.message;
            toast.error(msg, {
                className: "red-css"
            });
        });
        setTimeout(() => {
            this.getRoleList();
        }, 500);

    }

    handleActiveTab = (value) => {
        this.setState({
            activeTab: value
        })
    }

    renderModalBody = () => {
        const { isFocus, modalType, currentRole, disabledBtn, activeTab, status } = this.state;
        const customStyle = isFocus ? { borderRadius: 0, borderWidth: 2, backgroundColor: 'transparent', borderColor: "#E3E3E3", color: "black" }
            : { borderRadius: 0, borderWidth: 2, backgroundColor: 'transparent', color: 'black' };

        const isEdit = modalType === "Edit" ? true : false;
        if (modalType === "Add" || modalType === "Edit") {
            return (
                <div>
                    <Modal.Header closeButton style={{ padding: '0px 0px 0px 20px' }}>
                        <Modal.Title style={{ fontWeight: 700 }}>{modalType} Role</Modal.Title>
                    </Modal.Header>
                    <hr style={{ borderWidth: 2 }} />
                    <Formik
                        enableReinitialize
                        validateOnChange={false}
                        validateOnBlur={false}
                        validate={values => {
                            const errors = {};

                            if (values.name.trim().length <= 0) {
                                errors.name = "Please provide valid name"
                            }

                            return errors;
                        }}
                        onSubmit={(values, { setStatus, setSubmitting }) => {
                            if (isEdit) {
                                this.handleEditRoleSubmit(values, setSubmitting);
                            } else {
                                this.handleAddRoleSubmit(values, setSubmitting);
                            }
                        }}

                        initialValues={{
                            name: isEdit ? currentRole && currentRole.name : ''
                        }}
                    >
                        {({
                            handleSubmit,
                            handleChange,
                            values,
                            touched,
                            errors,
                            isSubmitting
                        }) => (
                            <Form noValidate={true}
                                onSubmit={handleSubmit}
                            >
                                <Modal.Body className="pt-0">
                                    <div className='fv-row mb-4'>
                                        <label className='form-label mb-0 fw-600 text-dark'>Role Name</label>
                                        <input
                                            required
                                            placeholder='Role Name'
                                            className={clsx(
                                                'form-control form-control-solid',
                                                { 'is-invalid': touched.name && errors.name },
                                                {
                                                    'is-valid': touched.name && !errors.name,
                                                }
                                            )}
                                            type='text'
                                            name='name'
                                            autoComplete='off'
                                            onFocus={() => this.changeFocus()}
                                            onChange={handleChange}
                                            value={values.name}
                                        />
                                        {touched.name && errors.name && (
                                            <div className='fv-plugins-message-container'>
                                                <span role='alert'>{errors.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </Modal.Body>
                                <hr className="line-style" />
                                <Modal.Footer>
                                    <Button type="submit" className="ml-auto mr-3" variant="primary" disabled={isSubmitting}>
                                        {isEdit ? "Update" : "Add"}
                                    </Button>
                                </Modal.Footer>
                            </Form>)}
                    </Formik>
                </div>
            );
        } else if (modalType === "Delete") {
            return (
                <div>
                    <Modal.Header closeButton style={{ padding: '0px 0px 0px 20px' }}>
                        <Modal.Title style={{ fontWeight: 700 }} className="text-dark">Delete Role</Modal.Title>
                    </Modal.Header>
                    <hr style={{ borderWidth: 2 }} />
                    <Form noValidate>
                        <Modal.Body>
                            <Form.Group as={Col} md="12" className={"text-center"}>
                                <Form.Label style={{ fontWeight: 400 }} className="text-muted">
                                    Are you sure you want to delete
                                    this Role with <b className="text-dark">{currentRole && currentRole.name}</b> ?</Form.Label>
                            </Form.Group>
                        </Modal.Body>
                        <hr className="line-style" />
                        <Modal.Footer>
                            <Button className="ml-auto mr-3 w-auto" variant="danger" disabled={disabledBtn}
                                onClick={(e) => this.handleDelete(e)}>
                                Delete
                            </Button>
                        </Modal.Footer>
                    </Form>
                </div>
            );
        } else if (modalType === "ActiveStatus") {
            return (
                <div>
                    <Modal.Header closeButton style={{ padding: '0px 0px 0px 20px' }}>
                        <Modal.Title style={{ fontWeight: 700 }} className="text-dark">Change Role Status</Modal.Title>
                    </Modal.Header>
                    <hr style={{ borderWidth: 2 }} />
                    <Form noValidate>
                        <Modal.Body>
                            <Form.Group as={Col} md="12" className={"text-center"}>
                                <Form.Label style={{ fontWeight: 400 }} className="text-muted">
                                    Are you sure you want to {currentRole.status === 0 ? <b>Activate </b> : <b>Deactivate </b>}
                                    this Role with <b>{currentRole && currentRole.name}</b> ?</Form.Label>
                            </Form.Group>
                        </Modal.Body>
                        <hr className="line-style" />
                        <Modal.Footer>
                            {currentRole.status === 0 ?
                                <Button className="ml-auto mr-3 w-auto" variant="success" disabled={disabledBtn}
                                    onClick={(e) => this.handleSwitchChange(e)}>
                                    Activate
                                </Button>
                                :
                                <Button className="ml-auto mr-3 w-auto" variant="danger" disabled={disabledBtn}
                                    onClick={(e) => this.handleSwitchChange(e)}>
                                    Deactivate
                                </Button>
                            }
                        </Modal.Footer>
                    </Form>
                </div>
            );
        }
    }

    render() {
        const { roleData, roleCount, activePage, limit, searchValue, loading, isFocus, startDate, endDate } = this.state;
        const customStyle = isFocus ? styleSearch
            : { borderWidth: 2 };

        return (
            <div>
                <TitleComponent title={this.props.title} icon={this.props.icon} />
                <div className="row">
                    <div className="col-md-12">
                        <div className="kt-section bg-white px-4 py-2 border-top">
                            <form className="kt-quick-search__form" onSubmit={(e) => { e.preventDefault() }}>
                                <div className="row">
                                    <div className="input-group align-self-center col-9 col-md-3 mb-0">
                                        <div className="input-group-prepend">
                                            <span className="input-group-text" style={{ borderWidth: 2 }}>
                                                <i className="flaticon2-search-1" />
                                            </span>
                                        </div>

                                        <input
                                            type="text"
                                            ref={this.inputRef}
                                            placeholder="Search..."
                                            value={searchValue}
                                            onFocus={() => this.changeFocus()}
                                            style={customStyle}
                                            onChange={this.handleSearchChange}
                                            className="form-control kt-quick-search__input h-auto"
                                        />
                                        {(searchValue) && (
                                            <div className="input-group-append" onClick={this.clear}>
                                                <span className="input-group-text" style={{ borderWidth: 2 }}>
                                                    <i className="la la-close kt-quick-search__close"
                                                        style={{ display: "flex" }} />
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mr-md-3">
                                        <Button type="button" className='btn btn-primary btn-elevate kt-login__btn-primary'
                                            onClick={this.handleSubmit}>
                                            Search
                                        </Button>
                                    </div>
                                    <div className="mr-3 ml-3 ml-md-0">
                                        <Button type="button" className='btn btn-info btn-elevate kt-login__btn-info'
                                            onClick={this.handleReset}>
                                            Reset</Button>
                                    </div>
                                    <Dropdown drop="down">
                                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                                            Status</Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => this.handleStatus(1)}>Active</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.handleStatus(0)}>Inactive</Dropdown.Item>
                                            <Dropdown.Item onClick={() => this.handleStatus(2)}>All</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    <div className="mr-2 ml-auto">
                                        <Button
                                            className='btn btn-primary btn-elevate kt-login__btn-warning'
                                            onClick={(e) => this.handleModal("Add")}
                                        >
                                            Add Role
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <ToastContainer />
                <Portlet className={'shadow-none'}>
                    <PortletBody>
                        {loading ? <div className="text-center py-3" ><CircularProgress />
                        </div> :
                            <Table striped responsive bordered hover className="table-list-header m-0">
                                <thead>
                                    <tr>
                                        <th>
                                            <span className="pl-md-5"><b>Name</b></span>
                                            <i className='flaticon2-up ml-2 ctriggerclick arrow-icons'
                                                style={{ fontSize: 10 }} onClick={() => this.handleSorting('name', 'ASC')} />
                                            <i className='flaticon2-down ctriggerclick arrow-icons'
                                                style={{ fontSize: 10 }} onClick={() => this.handleSorting('name', 'DESC')} />
                                        </th>
                                        <th width="20%" className="text-center"><b>Status</b></th>
                                        <th width="15%" className="text-center"><b>Action</b></th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {roleData.length > 0 ?
                                        roleData.map((item, index) =>
                                            <tr key={item.id}>
                                                <td>
                                                    <h6 className={'font-weight-bold text-muted pl-md-5'}>{item.name}</h6>
                                                </td>
                                                <td className="text-center">
                                                    <h6 className={'font-weight-bold Status_activation'}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            this.handleModal("ActiveStatus", item)
                                                        }}
                                                    >
                                                        {item.status === 1 ? <span className={'text-success border-bottom border-success'}>Active</span> : <span className={'text-danger border-bottom border-danger'}>Deactive</span>}
                                                    </h6>
                                                </td>
                                                <td className="text-center">
                                                    <OverlayTrigger
                                                        placement="left"
                                                        overlay={<Tooltip id="documentations-tooltip">Edit</Tooltip>}>
                                                        <a className="kt-menu__link-icon flaticon2-edit pr-4 text-warning"
                                                            style={{ fontSize: '1.3rem' }}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                this.handleModal("Edit", item);
                                                            }}></a>
                                                    </OverlayTrigger>
                                                    <OverlayTrigger
                                                        placement="left"
                                                        overlay={<Tooltip id="documentations-tooltip">Delete</Tooltip>}>
                                                        <a className="kt-menu__link-icon flaticon2-rubbish-bin-delete-button text-danger"
                                                            style={{ fontSize: '1.3rem' }}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                this.handleModal("Delete", item)
                                                            }}></a>
                                                    </OverlayTrigger>
                                                </td>
                                            </tr>
                                        )
                                        :
                                        <tr>
                                            <td colSpan="12" className="text-center">
                                                <div className="col-md-6 col-lg-4 mx-auto text-center mt-5">
                                                    <div className="card card-custom text-center py-5 border-doted-dark bg-transparent">
                                                        <div className="card-body">
                                                            <span className="bg-light-danger p-3 text-dark rounded">
                                                                <BrandingWatermark />
                                                            </span>
                                                            <h3 className="text-dark mb-0 mt-4">No Roles have been Found</h3>
                                                            <span className="mt-2">Simply click above button to add new role</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    }
                                </tbody>
                            </Table>}
                    </PortletBody>
                </Portlet>

                {(roleCount > limit) &&
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center px-4 cus-pagination">
                        <h5 className="text-dark mb-3 mb-md-0">{paginationTexts(activePage, roleCount, limit)}</h5>
                        <Pagination
                            bsSize={'medium'}
                            activePage={activePage}
                            itemsCountPerPage={limit}
                            totalItemsCount={roleCount}
                            pageRangeDisplayed={5}
                            onChange={this.handleSelect}
                            itemClass="page-item"
                            linkClass="page-link"
                        />
                    </div>}
                <Modal centered size="md" show={this.state.show} onHide={() => {
                    this.handleClose();
                }} style={{ opacity: 1 }}>
                    {this.renderModalBody()}
                </Modal>
            </div>
        );
    }
}

const styleSearch = {
    borderColor: "#E3E3E3", borderWidth: 2, borderLeftWidth: 0, borderRightWidth: 0
}

const mapStateToProps = ({ auth: { authToken } }) => ({
    authToken
});

export default connect(mapStateToProps)(Roles);