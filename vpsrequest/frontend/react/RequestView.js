import React from 'react';
import {Backend} from './DataManager';
import { BaseView, LoadingAnim, RequestHorizontalRule, Status } from './UIElements';
import { DateFormatHR } from './Util';
import {
    Col,
    Row,
    } from 'reactstrap';
import { CONFIG } from './Config'
import { useQuery } from 'react-query';


const RequestRow = ({...props}) =>
(
  <Row className="form-group align-items-center">
    <Col md={{size: 2, offset: 1}} className="d-flex justify-content-end">
      <span
        className="mr-2">
        {props.label}
      </span>
    </Col>
    <Col md={{size: 7}} >
      <span style={{whiteSpace: 'pre-wrap'}}>{props.value}</span>
    </Col>
  </Row>
)

const RequestAdminDetails = ({values}) =>
{
  if(values.approved === 3)
    return(
      <React.Fragment>
        <RequestRow label="Odobrio:" value={values.approvedby}/>
        <RequestRow label="IP adresa:" value={values.vm_ip}/>
        <RequestRow label="Poruka:" value={values.vm_reason}/>
        <RequestRow label="Datum umirovljenja:" value={values.vm_dismissed}/>
      </React.Fragment>
    )
  else
    return(
      <React.Fragment>
        <RequestRow label="Poruka:" value={values.vm_reason}/>
      </React.Fragment>
    )
}

const RequestDetails = ({values, userDetails}) =>
{
  let reqStatus = <Status params={CONFIG['status'][values.approved]}/>
  let adminRemark = null
  if(userDetails.is_staff)
    adminRemark = <RequestRow label="Napomena administratora:" value={values.vm_admin_remark}/>

  return (
    <React.Fragment>
      <h4 className="mb-3 mt-4">Kontaktna osoba Ustanove</h4><br/>
      <RequestRow label="Ime:" value={values.first_name}/>
      <RequestRow label="Prezime:" value={values.last_name}/>
      <RequestRow label="Ustanova:" value={values.institution}/>
      <RequestRow label="Funkcija:" value={values.role}/>
      <RequestRow label="Email:" value={values.email}/>
      <RequestHorizontalRule/>

      <h4 className="mb-3 mt-4">Zahtjevani resursi</h4><br/>
      <RequestRow label="Namjena:" value={values.vm_purpose}/>
      <RequestRow label="Puno ime poslužitelja (FQDN):" value={values.vm_fqdn}/>
      <RequestRow label="Operacijski sustav:" value={values.vm_os}/>
      <RequestRow label="Napomena:" value={values.vm_remark}/>
      <RequestHorizontalRule/>

      <h4 className="mb-3 mt-4">Sistem-inženjer virtualnog poslužitelja</h4><br/>
      <RequestRow label="Ime:" value={values.sys_firstname}/>
      <RequestRow label="Prezime:" value={values.sys_lastname}/>
      <RequestRow label="Ustanova:" value={values.sys_institution}/>
      <RequestRow label="Funkcija:" value={values.sys_role}/>
      <RequestRow label="Email:" value={values.sys_email}/>
      <RequestRow label="AAI@EduHr korisnička oznaka:" value={values.sys_aaieduhr}/>
      <RequestHorizontalRule/>

      <h4 className="mb-3 mt-4">Čelnik ustanove</h4><br/>
      <RequestRow label="Ime:" value={values.head_firstname}/>
      <RequestRow label="Prezime:" value={values.head_lastname}/>
      <RequestRow label="Ustanova:" value={values.head_institution}/>
      <RequestRow label="Funkcija:" value={values.head_role}/>
      <RequestRow label="Email:" value={values.head_email}/>
      <RequestHorizontalRule/>

      {adminRemark}
      <RequestRow label="Status:" value={reqStatus}/>
      <RequestRow label="Datum podnošenja:" value={values.request_date}/>
      <RequestAdminDetails values={values}/>
    </React.Fragment>
  )
}


export const ViewSingleRequest = (props) => {
  let {params} = props.match
  const requestID = params.id
  const apiListRequests = CONFIG.listReqUrl
  const backend = new Backend()

  const { data: userDetails, error: errorUserDetails, isLoading: loadingUserDetails } = useQuery(
    `session-userdetails`, async () => {
      const sessionActive = await backend.isActiveSession()
      if (sessionActive.active) {
        return sessionActive.userdetails
      }
    }
  );

  const { data: requestDetails, error: errorRequest, isLoading: loadingRequests } = useQuery(
    `stanje-zahtjeva-requests-${requestID}`, async () => {
      const fetched = await backend.fetchData(`${apiListRequests}/${requestID}/handlenew`)
      return fetched
    },
    {
      enabled: userDetails
    }
  );


  if (userDetails && requestDetails)
    var initValues = {
      location: '',
      first_name: requestDetails.user.first_name,
      last_name: requestDetails.user.last_name,
      institution: requestDetails.user.institution,
      role: requestDetails.user.role,
      email: requestDetails.user.email,
      aaieduhr: requestDetails.user.aaieduhr,
      approvedby: requestDetails.approvedby,
      vm_fqdn: requestDetails.vm_fqdn,
      vm_purpose: requestDetails.vm_purpose,
      vm_admin_remark: requestDetails.vm_admin_remark,
      vm_reason: requestDetails.vm_reason,
      vm_remark: requestDetails.vm_remark,
      vm_os: requestDetails.vm_os,
      vm_ip: requestDetails.vm_ip,
      approved: requestDetails.approved,
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
      timestamp: DateFormatHR(requestDetails.timestamp),
      vm_dismissed: DateFormatHR(requestDetails.vm_dismissed)
    }

  if (loadingUserDetails || loadingRequests)
    return (<LoadingAnim />)

  else if (!loadingUserDetails && initValues) {
    return (
      <BaseView
        title='Detalji zahtjeva'>
        <RequestDetails values={initValues} userDetails={userDetails}/>
      </BaseView>
    )
  }

  else
    return null
}
