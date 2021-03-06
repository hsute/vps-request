import { BaseView, DropDown, LoadingAnim, Status } from './UIElements';
import NotFound from './NotFound';
import React from 'react';
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
import { useQuery } from 'react-query';
import { DateFormatHR } from './Util'

const MyRequestsActive = (props) => {
  const location = props.location;
  const backend = new Backend();
  const apiListRequests = `${CONFIG.listReqUrl}/mine_active`

  const { data: userDetails, error: errorUserDetails, isLoading: loadingUserDetails } = useQuery(
    `session-userdetails`, async () => {
      const sessionActive = await backend.isActiveSession()
      if (sessionActive.active) {
        return sessionActive.userdetails
      }
    }
  );

  const { data: requests, error: errorRequest, isLoading: loadingRequests } = useQuery(
    `aktivni-vmovi-requests`, async () => {
      const fetched = await backend.fetchData(apiListRequests)
      return fetched
    },
    {
      enabled: userDetails
    }
  );

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

  if (loadingRequests || loadingUserDetails)
    return (<LoadingAnim />)

  else if (!loadingRequests && requests) {
    return (
      <BaseView
        title='Aktivni poslužitelji'
        location={location}>
        <Formik
          initialValues={{activeRequests: emptyIfNullRequestPropery(requests)}}
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
                            <th style={{width: '180px'}}>Potreban u {new Date().getFullYear()}.</th>
                            <th>Komentar</th>
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
                                <td  className="align-middle text-center">
                                  <Field
                                    name={`activeRequests.${index}.vm_isactive`}
                                    component={DropDown}
                                    data={['Odaberi', 'Da', 'Ne', 'Nisam siguran']}
                                    customclassname="text-center"
                                  />
                                </td>
                                <td className="align-middle text-center">
                                  <Field
                                    className="form-control"
                                    name={`activeRequests.${index}.vm_isactive_comment`}
                                    as="textarea"
                                    rows={1}
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
