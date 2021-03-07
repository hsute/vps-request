import {
  BaseView,
  DropDown,
  LoadingAnim,
  Status,
  NotifyOk,
  NotifyError,
} from './UIElements';
import NotFound from './NotFound';
import React, { useEffect, useState } from 'react';
import { Backend } from './DataManager';
import {
  Button,
  Row,
  Col,
  Table
} from 'reactstrap';
import './App.css';
import 'react-notifications/lib/notifications.css';
import { Formik, Field, FieldArray, Form } from 'formik';
import { CONFIG } from './Config'
import { DateFormatHR } from './Util'

const DropDownMyActive = ({field, data=[], ...props}) =>
  <Field component="select"
    name={field.name}
    required={true}
    className={`form-control custom-select ${props.customclassname}
                ${field.value === 'Da' ? 'border-success' : 'border-danger'}`}
    {...props}
  >
    {
      data.map((name, i) =>
        i === 0 ?
          <option key={i} hidden>{name}</option> :
          <option key={i} value={name}>{name}</option>
      )
    }
  </Field>

const MyRequestsActive = (props) => {
  const location = props.location;
  const backend = new Backend();
  const apiListRequestsActive = `${CONFIG.listReqUrl}/mine_active`
  const [loadingRequests, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(undefined);
  const [requestsData, setRequests] = useState(undefined);

  const initializeComponent = async () => {
    const session = await backend.isActiveSession();

    if (session.active) {
      const requestData = await backend.fetchData(`${apiListRequestsActive}`);
      setRequests(requestData);
      setUserDetails(session.userdetails);
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    initializeComponent();
  }, [])


  function emptyIfNullRequestPropery(data) {
    var tmp_requests = new Array()

    data.forEach(
      request => {
        var tmp_request = new Object()
        for (var property in request) {
          if (request[property] === null )
            tmp_request[property] = ''
          else
            tmp_request[property] = request[property]
        }
        tmp_requests.push(tmp_request)
      }
    )
    return tmp_requests
  }

  function isActiveToStrings(data) {
    var tmp_requests = new Array()

    data.forEach(
      request => {
        var tmp_request = new Object()
        for (var property in request) {
          if (property === 'vm_isactive' && request[property] !== '')
            tmp_request[property] = CONFIG['statusVMIsActive'][request.vm_isactive]
          else
            tmp_request[property] = request[property]
        }
        tmp_requests.push(tmp_request)
      }
    )
    return tmp_requests

  }

  const handleOnSubmit = async (data) => {
    let response = await backend.changeObject(`${apiListRequestsActive}/`, data);

    if (response.ok)
      NotifyOk({
        msg: 'Statusi poslužitelja podneseni',
        title: `Uspješno - HTTP ${response.status}`});
    else
      NotifyError({
        msg: response.statusText,
        title: `Greška - HTTP ${response.status}`});
  }

  if (loadingRequests)
    return (<LoadingAnim />)

  else if (!loadingRequests && requestsData) {
    return (
      <BaseView
        title='Aktivni poslužitelji'
        location={location}>
        <Formik
          initialValues={{activeRequests: isActiveToStrings(emptyIfNullRequestPropery(requestsData))}}
          onSubmit={({activeRequests})=> {
            activeRequests.forEach(request => (
              request.vm_isactive = CONFIG['statusVMIsActive'][request.vm_isactive]
            ))
            handleOnSubmit(activeRequests)
          }}
        >
          {props => (
            <Form>
              <FieldArray
                name="activeRequests"
                render={() => (
                  <React.Fragment>
                    <Row>
                      <Table responsive hover size="sm" className="mt-4">
                        <thead className="table-active align-middle text-center">
                          <tr>
                            <th style={{width: '90px'}}>Status</th>
                            <th style={{width: '180px'}}>Datum podnošenja</th>
                            <th style={{width: '250px'}}>Poslužitelj</th>
                            <th>Komentar</th>
                            <th style={{width: '140px'}}>Potreban u {new Date().getFullYear()}.</th>
                          </tr>
                        </thead>
                        <tbody className="align-middle text-center">
                          {
                            props.values.activeRequests.map((request, index) =>
                              <tr key={index}>
                                <td className="align-middle text-center">
                                  <Status params={CONFIG['status'][request.approved]} renderToolTip={true}/>
                                </td>
                                <td className="align-middle text-center">
                                  { DateFormatHR(request.request_date) }
                                </td>
                                <td className="align-middle text-center">
                                  { request.vm_fqdn }
                                </td>
                                <td className="align-middle text-center">
                                  <Field
                                    className="form-control"
                                    name={`activeRequests.${index}.vm_isactive_comment`}
                                    as="textarea"
                                    rows={1}
                                  />
                                </td>
                                <td className="align-middle text-center">
                                  <Field
                                    name={`activeRequests.${index}.vm_isactive`}
                                    component={DropDownMyActive}
                                    data={['Odaberi', 'Da', 'Ne']}
                                    required={true}
                                    customclassname="text-center"
                                  />
                                </td>
                              </tr>)
                          }
                        </tbody>
                      </Table>
                    </Row>
                    <Row className="mt-2 mb-2 text-center">
                      <Col>
                        <Button className="btn-lg" color="success" id="submit-button" type="submit">Spremi</Button>
                      </Col>
                    </Row>
                  </React.Fragment>
                )}
              />
            </Form>
          )}
        </Formik>
      </BaseView>
    )
  }
  else
    return null
}

export default MyRequestsActive;
