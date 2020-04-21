import React, { Component } from 'react';
import {
  BaseView,
  LoadingAnim,
  NotifyOk,
  NotifyError,
} from './UIElements.js';
import { Formik, Form } from 'formik';
import {
  ContactUserFields,
  HeadFields,
  RequestDateField,
  StateFields,
  SubmitChangeRequest,
  SysAdminFields,
  VMFields,
} from './RequestElements.js';


export class ChangeRequest extends Component
{
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      listVMOSes: [],
      requestDetails: undefined,
      requestApproved: undefined,
      userDetail: undefined,
    }

    let {params} = this.props.match
    this.requestID = params.id

    this.apiListVMOSes = '/api/v1/internal/vmos/'
    this.apiListRequests = '/api/v1/internal/requests'

    this.backend = new Backend()
    this.handleOnSubmit = this.handleOnSubmit.bind(this)
    this.initializeComponent = this.initializeComponent.bind(this)
  }

  isRequestApproved(value) {
    return value === 1 ? true : false
  }

  async initializeComponent() {
    const session = await this.backend.isActiveSession()

    if (session.active) {
      const vmOSes = await this.backend.fetchData(this.apiListVMOSes)
      const requestData = await this.backend.fetchData(`${this.apiListRequests}/${this.requestID}`)

      this.setState({
        listVMOSes: vmOSes.map(e => e.vm_os),
        userDetails: session.userdetails,
        requestDetails: requestData,
        requestApproved: this.isRequestApproved(requestData.approved),
        loading: false
      })
    }
  }

  componentDidMount() {
    this.setState({loading: true})
    this.initializeComponent()
  }

  handleOnSubmit(data) {
    this.backend.changeObject(`${this.apiListRequests}/${this.requestID}/`, data)
      .then(response => {
        response.ok
          ? NotifyOk({
              msg: 'Zahtjev uspješno promijenjen',
              title: `Uspješno - HTTP ${response.status}`})
          : NotifyError({
              msg: response.statusText,
              title: `Greška - HTTP ${response.status}`})
      })
  }

  render() {
    const {loading, listVMOSes, userDetails,
      requestApproved, requestDetails} = this.state

    if (userDetails && requestDetails)
      var initValues = {
        location: '',
        first_name: userDetails.first_name,
        last_name: userDetails.last_name,
        institution: userDetails.institution,
        role: userDetails.role,
        email: userDetails.email,
        aaieduhr: userDetails.aaieduhr,
        approvedby: requestDetails.approvedby,
        vm_fqdn: requestDetails.vm_fqdn,
        vm_purpose: requestDetails.vm_purpose,
        vm_admin_remark: requestDetails.vm_admin_remark,
        vm_reason: requestDetails.vm_reason,
        vm_remark: requestDetails.vm_remark,
        vm_os: requestDetails.vm_os,
        vm_ip: requestDetails.vm_ip,
        approved: requestApproved,
        sys_firstname: requestDetails.sys_firstname,
        sys_aaieduhr: requestDetails.sys_aaieduhr,
        sys_lastname: requestDetails.sys_lastname,
        sys_institution: requestDetails.sys_institution,
        sys_role: requestDetails.sys_role,
        sys_email: requestDetails.sys_email,
        head_firstname: requestDetails.head_firstname,
        head_lastname: requestDetails.head_lastname,
        head_institution: requestDetails.head_institution,
        head_role: requestDetails.head_role,
        head_email: requestDetails.head_email,
        request_date: DateFormatHR(requestDetails.request_date),
        timestamp: DateFormatHR(requestDetails.timestamp)
      }

    if (loading)
      return (<LoadingAnim />)

    else if (!loading && listVMOSes && initValues) {
      return (
        <BaseView
          title='Promijeni zahtjev'
          isChangeView={true}>
          <Formik
            initialValues={initValues}
            onSubmit={(values, actions) => {
              values.timestamp = new Date().toISOString()
              values.request_date = requestDetails.request_date
              this.handleOnSubmit(values)
            }}
            render = {props => (
              <Form>
                <RequestDateField/>
                <ContactUserFields/>
                <VMFields listVMOSes={listVMOSes}/>
                <SysAdminFields/>
                <HeadFields/>
                <StateFields isSuperUser={userDetails.is_superuser}/>
                <SubmitChangeRequest buttonLabel='Promijeni zahtjev'/>
              </Form>
            )}
          />
        </BaseView>
      )
    }

    else
      return null
  }
}
