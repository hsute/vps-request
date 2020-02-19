import React from 'react';
import Cookies from 'universal-cookie';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Nav,
  NavLink,
  NavItem,
  NavbarBrand,
  Navbar,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter} from 'reactstrap';
import {Link} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignOutAlt,
  faSearch,
  faFileAlt,
  faFileSignature,
  faHandshake,
  faThumbsDown,
  faBatteryHalf} from '@fortawesome/free-solid-svg-icons';
import { NotificationManager } from 'react-notifications';
import { Field } from 'formik';
import Autocomplete from 'react-autocomplete';
import SrceLogo from './logos/pravisrce.png';
import SrceLogoTiny from './logos/srce-logo-e-mail-sig.png';
import CloudLogo from './logos/logo_cloud.png';

import './UIElements.css';

var list_pages = ['novi-zahtjevi', 'odobreni-zahtjevi', 'odbijeni-zahtjevi', 'novi-zahtjev', 'stanje-zahtjeva'];

var link_title = new Map();
link_title.set('novi-zahtjevi', 'Novi zahtjevi');
link_title.set('odobreni-zahtjevi', 'Odobreni zahtjevi');
link_title.set('odbijeni-zahtjevi', 'Odbijeni zahtjevi');
link_title.set('novi-zahtjev', 'Zahtjev za novim VM-om');
link_title.set('stanje-zahtjeva', 'Stanje zahtjeva');


export const Icon = props => {
  let link_icon = new Map();
  link_icon.set('novi-zahtjevi', faFileAlt);
  link_icon.set('odobreni-zahtjevi', faHandshake);
  link_icon.set('odbijeni-zahtjevi', faThumbsDown);
  link_icon.set('novi-zahtjev', faFileSignature);
  link_icon.set('stanje-zahtjeva', faBatteryHalf);

  return <FontAwesomeIcon
            icon={link_icon.get(props.i)}
            size='1x' fixedWidth/>
}


export const DropDown = ({field, data=[]}) =>
  <Field component="select"
    name={field.name}
    required={true}
    className="form-control custom-select"
  >
    {
      data.map((name, i) =>
        i === 0 ?
        <option key={i} hidden>{name}</option> :
        <option key={i} value={name}>{name}</option>
      )
    }
  </Field>


export const SearchField = ({form, field, ...rest}) =>
  <div className="input-group">
    <input type="text" placeholder="Search" {...field} {...rest}/>
    <div className="input-group-append">
      <span className="input-group-text" id="basic-addon">
        <FontAwesomeIcon icon={faSearch}/>
      </span>
    </div>
  </div>


const doLogout = (history, onLogout) => {
  let cookies = new Cookies();

  onLogout();

  return fetch('/rest-auth/logout/', {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRFToken': cookies.get('csrftoken'),
      'Referer': 'same-origin'
    }}).then((response) => history.push('/ui/login'));
}


export const InfoLink = ({prefix='', suffix='', linkTitle='', linkHref}) => (
  <React.Fragment>
    {prefix}
    <a href={linkHref}>{!linkTitle ? linkHref : linkTitle}</a>
    {suffix}
  </React.Fragment>
)


export const ModalAreYouSure = ({isOpen, toggle, title, msg, onYes}) => (
  <Modal isOpen={isOpen} toggle={toggle}>
    <ModalHeader toggle={toggle}>{title}</ModalHeader>
    <ModalBody>
      {msg}
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={() => {
        onYes();
        toggle();
      }}>Da</Button>{' '}
      <Button color="secondary" onClick={toggle}>Ne</Button>
    </ModalFooter>
  </Modal>
)


export const NavigationBar = ({history, onLogout, isOpenModal, toggle, titleModal, msgModal}) => (
  <React.Fragment>
    <ModalAreYouSure
      isOpen={isOpenModal}
      toggle={toggle}
      title={titleModal}
      msg={msgModal}
      onYes={() => doLogout(history, onLogout)} />
    <Navbar expand="md" id="vpsreq-nav" className="border rounded d-flex justify-content-between pt-3 pb-3">
      <NavbarBrand className="text-dark">
        <img src={CloudLogo} id="cloud logo" alt="VPS Cloud Logo"/>
      </NavbarBrand>
      <Nav navbar className="m-1">
        <span className="pl-3 font-weight-bold text-center">
          <h3>
            Zahtjev za virtualnim poslužiteljem (VM) u usluzi Virtual Private Server
          </h3>
        </span>
      </Nav>
      <Nav navbar >
        <NavItem className='m-2 text-dark'>
          <React.Fragment>
            Dobrodošli,
            <br/>
            <strong>{localStorage.getItem('authUsername')}</strong>
          </React.Fragment>
        </NavItem>
        <NavItem className='m-2 text-light'>
          <Button
            size="sm"
            className='btn-danger'
            onClick={() => toggle()}>
            <FontAwesomeIcon icon={faSignOutAlt} color="white" />
          </Button>
        </NavItem>
      </Nav>
    </Navbar>
  </React.Fragment>
)


export const NavigationLinks = ({location}) => {
  var data = undefined;
  data = list_pages

  return (
    <Nav tabs id="vpsreq-navlinks" className="d-flex justify-content-center border-left border-right border-top rounded-top sticky-top pl-3 pr-3">
      {
        data.map((item, i) =>
          <NavItem key={i} className='mt-1 mr-2'>
            <NavLink
              tag={Link}
              active={location.pathname.split('/')[2] === item ? true : false}
              className={location.pathname.split('/')[2] === item ? "text-white bg-info" : "text-dark"}
              to={'/ui/' + item}><Icon i={item}/> {link_title.get(item)}
            </NavLink>
          </NavItem>
        )
      }
    </Nav>
  )
}


export const Footer = ({loginPage=false}) => {
  const InnerFooter = ({border=false, img=undefined}) =>
  (
    <React.Fragment>
      <div className={`text-center ${border && 'pt-2 pb-2'}`}>
        <img href="http://www.srce.unizg.hr/" src={img} id="srcelogo" alt="SRCE Logo"/>
      </div>
    </React.Fragment>
  )

  if (!loginPage) {
    return (
      <div id="vpsreq-footer" className="border rounded">
        <InnerFooter border={true} img={SrceLogo}/>
      </div>
    )
  }
  else {
    return (
      <div id="vpsreq-loginfooter">
        <InnerFooter img={SrceLogoTiny} />
      </div>
    )
  }
}


export const LoadingAnim = () => (
  <Card className="text-center">
    <CardHeader className="bg-light">
      <h4 className="text-dark">Loading data...</h4>
    </CardHeader>
    <CardBody>
      No anim
    </CardBody>
  </Card>
)


export const NotifyOk = ({msg='', title='', callback=undefined}) => {
  NotificationManager.success(msg,
    title,
    2000);
  setTimeout(callback, 2000);
}


export const BaseView = ({title='', modal=false, toggle=undefined, state=undefined, children}) =>
(
  <React.Fragment>
    {
      modal &&
      <ModalAreYouSure
        isOpen={state.areYouSureModal}
        toggle={toggle}
        title={state.modalTitle}
        msg={state.modalMsg}
        onYes={state.modalFunc} />
    }
    <div id="vpsreq-contentwrap" className="pl-4 pb-4 pr-4 pt-3 border rounded">
      {
        <div className="shadow-sm p-2 mb-2 bg-light rounded">
          <h3>{title}</h3>
        </div>
      }
      {children}
    </div>
  </React.Fragment>
)


function matchItem(item, value) {
  if (value)
    return item.toLowerCase().indexOf(value.toLowerCase()) !== -1;
}


export const AutocompleteField = ({lists, onselect_handler, field, val, icon, setFieldValue, req, label, values}) => {
  let classname = `form-control ${req && 'border-danger'}`;

  return(
    <Autocomplete
      inputProps={{className: classname}}
      getItemValue={(item) => item}
      items={lists}
      value={val}
      renderItem={(item, isHighlighted) =>
        <div
          key={lists.indexOf(item)}
          className={`vpsreq-autocomplete-entries ${isHighlighted ?
            "vpsreq-autocomplete-entries-highlighted"
            : ""}`
        }
        >
          {item ? <Icon i={icon}/> : ''} {item}
        </div>
      }
      renderInput={(props) => {
        if (label)
          return (
            <div className='input-group mb-3'>
              <div className='input-group-prepend'>
                <span className='input-group-text' id='basic-addon1'>{label}</span>
              </div>
              <input {...props} type='text' className={classname} aria-label='label'/>
            </div>
          );
        else
          return <input {...props}/>;
      }}
      onChange={(e) => {setFieldValue(field, e.target.value)}}
      onSelect={(val) =>  {
        setFieldValue(field, val)
        onselect_handler(field, val);
      }}
      wrapperStyle={{}}
      shouldItemRender={matchItem}
      renderMenu={(items) =>
        <div className='vpsreq-autocomplete-menu' children={items}/>
      }
    />
  );
}


export const DropdownFilterComponent = ({value, onChange, data}) => (
  <select
    onChange={onChange}
    style={{width: '100%'}}
    value={value}
  >
    <option key={0} value=''>Show all</option>
    {
      data.map((name, i) =>
        <option key={i + 1} value={name}>{name}</option>
      )
    }
  </select>
)
