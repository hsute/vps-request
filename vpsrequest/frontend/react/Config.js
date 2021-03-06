import {
  faCog,
  faTimes,
  faCheckDouble,
  faCheck,
  faCouch
} from '@fortawesome/free-solid-svg-icons';

export const RelativePath = '/zahtjev'

export const CONFIG = {
  'vmosUrl': `${RelativePath}/api/v1/internal/vmos/`,
  'listReqUrl': `${RelativePath}/api/v1/internal/requests/`,
  'logoutRedirect': 'https://www.srce.unizg.hr/cloud/vps',
  'status': {
    '-1': {
      'classname': 'text-warning',
      'id': 'Novi',
      'label': 'Novi',
      'icon': faCog
    },
    '0': {
      'classname': 'text-danger',
      'id': 'Odbijen',
      'label': 'Odbijen',
      'icon': faTimes
    },
    '1': {
      'classname': 'text-primary',
      'id': 'Odobren',
      'label': 'Odobren',
      'icon': faCheck
    },
    '2': {
      'classname': 'text-success',
      'id': 'IzdanVM',
      'label': 'Izdan VM',
      'icon': faCheckDouble
    },
    '3': {
      'classname': 'text-secondary',
      'id': 'Umirovljen',
      'label': 'Umirovljen',
      'icon': faCouch
    },
  },
  'statusVMIsActive': {
    "Da": 1,
    "Ne": 0,
    "1": "Da",
    "0": "Ne"
  }
}
