import React from 'react';
import { CHAI_LAI_LOGO_BASE64, LINE_ID } from '../constants';
import LineIcon from './LineIcon';

const Footer: React.FC = () => {
  return (
    <footer id="footer" className="bg-rose-50 mt-12 border-t">
      <div className="container mx-auto px-6 py-8 text-center text-black">
        <img src={CHAI_LAI_LOGO_BASE64} alt="ChaiLai Nails & Spa Logo" className="h-16 w-auto mx-auto mb-2" />
        <div className="space-y-2 text-sm mb-6">
            <p>777/88 ซอย บรมไตรโลกนารถ 18, ต.ในเมือง, อ.เมืองพิษณูโลก, จ.พิษณูโลก 65000</p>
            <p><strong>เวลาทำการ:</strong> 10:00 - 20:00 น. (ทุกวัน) | <strong>โทร:</strong> 099-272-8998</p>
            <p className="flex items-center justify-center gap-2">
              <LineIcon className="h-5 w-5 text-green-600" />
              <strong>Line ID:</strong> {LINE_ID}
            </p>
        </div>
        <div className="text-xs text-black/70">
          <p>
            &copy; {new Date().getFullYear()} ChaiLai Nails & Spa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;