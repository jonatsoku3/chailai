

import React from 'react';
import type { Page, Employee } from '../types';

interface AboutPageProps {
  employees: Employee[];
  setCurrentPage: (page: Page) => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ employees, setCurrentPage }) => {
  // Data for events, as previously established
  const events = [
    {
      date: '1 กันยายน 2024',
      title: 'กิจกรรมพัฒนาคุณภาพผู้เรียน',
      description: 'ณ ศูนย์ประสานแผนพัฒนาท้องถิ่นประจำอำเภอเมืองพิษณุโลก',
      images: [
        'https://scontent.fbkk4-2.fna.fbcdn.net/v/t39.30808-6/506032584_30113107061621206_4766131733810186687_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeHiQMqgqaX8QchJreF8yEzfJ2E17Md7rbYnYTXsx3uttueCHTIavoLqoVo4wen1h-4GcMhA9dd12D4LLgtBuvgR&_nc_ohc=y13yEXixb_MQ7kNvwEMUAeq&_nc_oc=AdmA9gczzzjRL-_AJDaEOY26YrKgVupDBGxevrWszBh_Hiir9P_fYcUexp8iviwKmS8&_nc_zt=23&_nc_ht=scontent.fbkk4-2.fna&_nc_gid=KhmI7MPcqjc43LRZRyTBZw&oh=00_AfcEtGRsWGYqm8DGtI_qA6n0S4AyUH3jTO1R8sAC3AMMHg&oe=68F567FE',
        'https://scontent.fbkk4-1.fna.fbcdn.net/v/t39.30808-6/505952670_30113107148287864_406691510221977041_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeH5oSYaj7a5VXbOhtMlM74Ngy-TxL50qSWDL5PEvnSpJc0GBbIfENXuwvx20pxEjtryQXXfSvR4IFbYMPlsojRM&_nc_ohc=Qf3VRFPZR0EQ7kNvwG7S7rO&_nc_oc=AdlkFN7u7j1IQKGNdHWX7GDSOzIHaujKZAZR0noxWYdSfpw71J1N2309OTRG32rQzi8&_nc_zt=23&_nc_ht=scontent.fbkk4-1.fna&_nc_gid=TPKojBO73vkKV8qjCaRxzA&oh=00_Afcn-82DS7_QmkiXGDPKiz81GE54xc1xRAALtWAdhOmDHA&oe=68F587AB',
        'https://scontent.fbkk4-1.fna.fbcdn.net/v/t39.30808-6/505787504_30113107114954534_8069327670211555735_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeEQtReQnZDll8-Sj2HrV-AhxTTOq7wNdUTFNM6rvA11ROGlotBppQKfPtD_f7XGxdX4rb_A5cJ4WxdJlli2bjQE&_nc_ohc=E96GD39c1iQQ7kNvwFpZUae&_nc_oc=AdkZUAIEQ1PDr7XnAnxZ4SOZ4zRuDqb83UsNPpL6bn9ZDlnqa3H8mvzWPmiyG1W_FVQ&_nc_zt=23&_nc_ht=scontent.fbkk4-1.fna&_nc_gid=nImGKg8ywi8lfLS6J_vJdA&oh=00_AfdQxdCZjldwAnFPozxSTv71LIjnygUh1gj47ywWg2M6Fw&oe=68F577A9',
      ],
    },
    {
      date: '26 กุมภาพันธ์ 2025',
      title: 'กิจกรรมการศึกษาเรียนรู้เพื่อพัฒนาตำบลท่าทอง',
      description: 'ณ ศูนย์ประสานแผนพัฒนาท้องถิ่นประจำ อำเภอท่าทอง จังหวัดพิษณุโลก',
      images: [
        'https://scontent.fbkk4-2.fna.fbcdn.net/v/t39.30808-6/480859694_28786773754254550_4489117005564665459_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeGqL_XiD3nONVW__iB-X12GUMGVjhc1VEdQwZWOFzVURzya-dtxF3qnG_RRqJuETm9b44Yj7IxMDd98UftzNIKK&_nc_ohc=bZWEvJzGNcIQ7kNvwFxuUxK&_nc_oc=Admvd3NTbmakVEZCfvZEzmuIp2pJu7ZrQX2Ukzku6hl7Az4zg45S1R-JKYz3LkpVMtY&_nc_zt=23&_nc_ht=scontent.fbkk4-2.fna&_nc_gid=IxFvKtzyYZYjpbY8AuW9ug&oh=00_AfegyoLRuV25CymDG1C_bwvAsIOBHgVoMnap98sjcvr6-g&oe=68F57B97',
        'https://scontent.fbkk4-2.fna.fbcdn.net/v/t39.30808-6/481065614_28786775567587702_9005572854936782432_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeHtF_cYYWwqaIG6YnNsD8nOO25zhZHlkvs7bnOFkeWS-0GFzXC_ry7F6ic9zQFA5hy2mXmSAbXNaQv8cZygJcPn&_nc_ohc=oK_sqIbyHlIQ7kNvwFhByZM&_nc_oc=AdkJtUGYfJ7TS09mQyAz5mn2KHJCTzPV9RMXb_OnZETljJhtQVYIvAXXDqdIZbaCN8A&_nc_zt=23&_nc_ht=scontent.fbkk4-2.fna&_nc_gid=puLuXdUh35OAIUxPg3SDHA&oh=00_Afd7UBlbC2Rc975gESYnKjPCJKpbV44Falf23xWEA6DwrQ&oe=68F56435',
        'https://scontent.fbkk4-3.fna.fbcdn.net/v/t39.30808-6/481672698_28786777387587520_6921314668196269231_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeFS4pJSXdpuwfzGgJ0RNq2RjlZUnNU3xc6OVlSc1TfFzuBLOuLHNDy4Td_uRZ6tECCW8Rm2RKEN81XwfVnnWa5g&_nc_ohc=B-jevHwqMIQQ7kNvwH1YpVL&_nc_oc=AdnMypXha6AbwnONQiH8qeOa0lbmZ_RoKvOLD-WTpIwhyMrDfQesNg8efUzx0v47ubE&_nc_zt=23&_nc_ht=scontent.fbkk4-3.fna&_nc_gid=1FA8fY_On48EG1peNi23aA&oh=00_Afdxw27bo3-pUly8s2H8OTLNINadpU9nVJnCeTS4cqH9mg&oe=68F55A35',
      ],
    },
    {
      date: '26 - 27 มีนาคม 2025',
      title: 'โครงการ ฝึกอบรมสร้างอาชีพเสริมสวย หลักสูตรเล็บเจล ',
      description: 'ณ ศูนย์ประสานแผนพัฒนาท้องถิ่นประจำ อำเภอชาติตระการ จังหวัดพิษณุโลก',
      images: [
        'https://scontent.fbkk4-2.fna.fbcdn.net/v/t39.30808-6/486480300_29098168856448370_8764826870664958926_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeG0FUTSraczd-YztP5J7b_FIOfw-j7-FUsg5_D6Pv4VSyIVO_dVr1tNSUifNMGHhmEY2UA5v7k9inTf3xghcH8a&_nc_ohc=7M33CAMPB08Q7kNvwHtHGVT&_nc_oc=AdmOpZURlnLkVVkDKvoyFtBtdSEzm47LF1q5GmrfZExMeK4KsoA5JwxDS-pNqwYL9V4&_nc_zt=23&_nc_ht=scontent.fbkk4-2.fna&_nc_gid=Rnnv8pgtpoaU9s3PZJBNxA&oh=00_Afc_QA3C0SusgEwMfH8Ucl-xYje513yqQR2gPAmb9bBjhA&oe=68F5818B',
        'https://scontent.fbkk4-3.fna.fbcdn.net/v/t39.30808-6/486458334_29098166053115317_6609041594616636474_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeFs25xZ-u_qk8Um_SjhX2mtnGDrfQ6ygGycYOt9DrKAbOoMZ-hO2potpHJzFd0Q2W7EUYTW8I34YEBx7NSUrHH7&_nc_ohc=TXbIZurDMHkQ7kNvwETrp08&_nc_oc=AdmMPW3LIiaJqPjda5wSbUTM6yFE2LkHdx7bfXxncJxxb4XIjaUKR2RnZb6OV5aCwIY&_nc_zt=23&_nc_ht=scontent.fbkk4-3.fna&_nc_gid=fOvy2ZStXbtXAGimLA_ZpA&oh=00_AffAc_jlGx_7_SJSLW99k0iFdhnqb1ovqlyhBT6uRFaPtA&oe=68F5793E',
        'https://scontent.fbkk4-2.fna.fbcdn.net/v/t39.30808-6/486728523_29098168283115094_4550269953740839950_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=101&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeF8OhmqMQyl4QWluimB57GSf-SPs0icXvx_5I-zSJxe_FdOKSmLx1kDMkJOwj0PcF-MZ1yB68aJ6bJlpiTnSgkR&_nc_ohc=3lJLiteKT6EQ7kNvwGXbBgp&_nc_oc=AdkvwGPAklk0MVRTIfDhxt13u6KmU-EPxU-yVLHwCFY5mPKNuNXgaPj1RNcA8hqWKBI&_nc_zt=23&_nc_ht=scontent.fbkk4-2.fna&_nc_gid=-WCDjRChq15tinm3ERm16Q&oh=00_AffnghzJazUUHVSyz60DmWTPsGtTPpX3qd9NIWqRWemIcw&oe=68F55EC0',
      ],
    }
  ];
  
  const studentImages = [
    { src: 'https://scontent.fbkk4-3.fna.fbcdn.net/v/t39.30808-6/545950203_31474952412103324_3341338119680456468_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHCKqNPLdcTOKckm5wm6wC-pgNI7U_veMSmA0jtT-94xDIug11znXDO7zPDQ3Zh7Hn3Uqw2Tcj2E7iOtm5H-53V&_nc_ohc=G3y6g-wwAOsQ7kNvwGhNy-3&_nc_oc=Adk34T4DrpblQLeIrN6uz7nPYcJoO5AKnFZeXo-DacucEjitxYbxR0d4Yg3B-KIhIPM&_nc_zt=23&_nc_ht=scontent.fbkk4-3.fna&_nc_gid=NUtt6rx5cxjEQLpP1EDFmA&oh=00_AffLfYPjF1x2FYn_Q1Ze2ZwtKIkSK0aP1zRUS_gEwpUPrw&oe=68F5A908', alt: 'ผลงานนักเรียน 1' },
    { src: 'https://scontent.fbkk4-2.fna.fbcdn.net/v/t39.30808-6/557598652_31721360337462529_476697895535804809_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeEx3oGiYJGbj1MvyUQJ2dzVk4FRSpHbdkmTgVFKkdt2SduWVDXf5bfhVoyChNK_b3GD_cpkWffvaZReZG_VEIi5&_nc_ohc=UHIwerXzA_oQ7kNvwEY1sfz&_nc_oc=AdmVTILYTpAI5knYlygC1sZbFab2ZfaAtmcb-PeWAWufvhBt200vV5oMcxBS19wYIrU&_nc_zt=23&_nc_ht=scontent.fbkk4-2.fna&_nc_gid=TaBo5T8cLHtSY0fa_OcPiA&oh=00_Afdjy0gVMoDtnQ7X-H6GJkVU9N3PvelLQedeJcUTL3O6hQ&oe=68F591F8', alt: 'ผลงานนักเรียน 2' },
    { src: 'https://scontent.fbkk4-1.fna.fbcdn.net/v/t39.30808-6/518356942_30620271034238137_1972409931406555979_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeGlymZOUpe3tgqgIUpzH8KbvkvGQO4NXta-S8ZA7g1e1iAQwW7_JP3KqIU4CNi0K5U_wkDhkvASjNYuFoMHGqqk&_nc_ohc=fVIdI1R3uNwQ7kNvwGXYoRx&_nc_oc=Adm0xxEtdnVAZArC9A9TANKnD8wWkBI5fWKZuhBQKo-FEweWDQp55E2R4mSA-JDc1Z4&_nc_zt=23&_nc_ht=scontent.fbkk4-1.fna&_nc_gid=QpTIqiSlLrlo24iNGdB3dg&oh=00_AfdwaMKGSvXII9WZeTImoull9uhEpa-DG__7xH0W0u6y2Q&oe=68F5BAAE', alt: 'ผลงานนักเรียน 3' },
    { src: 'https://scontent.fbkk4-1.fna.fbcdn.net/v/t39.30808-6/491975305_29393241590274427_1128980997115019037_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeE7Hm5_9ybzQIhoXoRpGH2ZJfo8Nse7LsAl-jw2x7suwO_PwDK0cG_Y_UxmVPViWYcwZ_R1z3pvJyDFOTqPJqCd&_nc_ohc=g0-hGqHl6mAQ7kNvwH6X-Fu&_nc_oc=AdlWUi8czf0_ycgiqW7NvHpuw45itm0ec6PXF7DOm486Bs_e8A4MPA3bkCUVJFVHKmA&_nc_zt=23&_nc_ht=scontent.fbkk4-1.fna&_nc_gid=5ir0INAMWnTmdtimulnH2w&oh=00_AfemthJIL3bCo8h5CmRm2t1rMAs42WKomldYJbfbQshZQQ&oe=68F5B39A', alt: 'ผลงานนักเรียน 4' },
    { src: 'https://scontent.fbkk4-2.fna.fbcdn.net/v/t39.30808-6/489272970_29225570393708215_9024159352319880254_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeG-ohlhD2g7V7UnzMIaT9TI3--Ky8Wp2Ljf74rLxanYuAGsCdWASD8uUiCCzWy1W0WBM9V5nOGxLhXHfFgVP9TM&_nc_ohc=pX9MJ3zJOgsQ7kNvwGX3_pj&_nc_oc=AdnORdPycAIti1XnsaKG40OcCBmHcTqkuY9Kt5WQnjvvaMLDAhzwGqp5v4lOQk_tqBo&_nc_zt=23&_nc_ht=scontent.fbkk4-2.fna&_nc_gid=P9XUM6x4uhs5yJNRmgv-Xg&oh=00_AffYWneOmEsIxPwnC_QBdvzizQ2hpoeLwGIa3F4Pd0YBjg&oe=68F59D8C', alt: 'ผลงานนักเรียน 5' },
    { src: 'https://scontent.fbkk4-1.fna.fbcdn.net/v/t39.30808-6/480662586_28756579070607352_4480990564268313706_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeG8WNy4KkhLp7gzm-gYMG1k3Oloh0zLAdbc6WiHTMsB1qr-mBsmHi-6xa4nyMA9YKBTv-6dQ5a5eDjGbTmcuuHF&_nc_ohc=Wn1l0iPuOfcQ7kNvwFqA_5O&_nc_oc=AdlL3D-E6BmLwMr9EK2l4Ld0qdnvLb6OmCinJH4bjoowNwB3cSUALN1X0Us2EE-0yFw&_nc_zt=23&_nc_ht=scontent.fbkk4-1.fna&_nc_gid=6Qb3e1VDIarvvsCEjkrocg&oh=00_Afc0bVZXMgN9G0Hxfyr6ZtihKZMjGNdUGnQyrggWLjuXgA&oe=68F58E25', alt: 'ผลงานนักเรียน 6' },
    { src: 'https://scontent.fbkk4-3.fna.fbcdn.net/v/t39.30808-6/480321468_28714774034787856_4380901802142280448_n.jpg?stp=dst-jpg_s600x600_tt6&_nc_cat=109&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeH5bQfBxM6KZR6pVOh_0Tado8i9a3_ok4-jyL1rf-iTj0nPMsNv5JJ3e8vp7GXKDcWjSxPNS_f2jRyE-oKGTZdp&_nc_ohc=e4N3kqKP3-MQ7kNvwEI3Rfy&_nc_oc=Adk9rzo93AuWYLo8FW0pY1wbDYTWpXut0mhhCQ3dNIKc3g591gbX6a9DysuHDdPce_0&_nc_zt=23&_nc_ht=scontent.fbkk4-3.fna&_nc_gid=sMKur3tLjPrqzwY_c8gSmQ&oh=00_AfeKNb5qrJDPycIgs5j_hzD2cDC_QEHJddzAqTzov2TGWg&oe=68F58C5D', alt: 'ผลงานนักเรียน 7' },
    { src: 'https://scontent.fbkk4-2.fna.fbcdn.net/v/t39.30808-6/474071357_28355223260742937_6294203007272355514_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeFXFD0uRyLGoRUKbnYSoDTMLkvN838-OKUuS83zfz44paBlqYjZM4NAfDb2exceWwZveF7evEWjFDFKw1x7w07X&_nc_ohc=l5f7q_K_v9sQ7kNvwGrws77&_nc_oc=AdlSqHJsrHp7kJe8VRyQcSOsBEHDWD69mvAi2X5omeJlb_z1bBCry8Kfgm89359pjOM&_nc_zt=23&_nc_ht=scontent.fbkk4-2.fna&_nc_gid=u5YTP_GAVnL39rHLhr5MQQ&oh=00_AfcLpzp6e6OgIKbvEorPFYI7d1YmBNe1CZ5nU4v8h9pHQQ&oe=68F59C7C', alt: 'ผลงานนักเรียน 8' },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section with Frame */}
      <div className="bg-white py-8 sm:py-12">
        <div className="container mx-auto px-6">
          <div className="relative p-2 bg-white rounded-2xl shadow-lg border border-gray-200">
            <img
              src="https://scontent.fbkk4-2.fna.fbcdn.net/v/t39.30808-6/470197781_28068933222705277_7837807587287939408_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=103&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeHI3Qm5x9No9sPROO-HnzQUEtv-CW5ZSFUS2_4JbllIVegPf7m4tY5mFgE4MVZbDcd280WLOWKFvPE3W7Ju6TW_&_nc_ohc=HcxQuvBFjcoQ7kNvwE6VZAE&_nc_oc=Adk7KpRUDUEOB2UNfMz4bQUgI9-uJ_HQMDLjqj_RA-Uw4gBftN__2BqDrb1-tEF4gXc&_nc_zt=23&_nc_ht=scontent.fbkk4-2.fna&_nc_gid=EQc-x3L-PlY9hHvoSh1Tbg&oh=00_Aff51vz5OPkWoQvjZyzZ-Sz1VDlc82s1zjckAjT84v8xOw&oe=68F53F3B"
              alt="บรรยากาศร้าน ChaiLai Nails & Spa"
              className="block w-full h-[40vh] min-h-[300px] object-cover rounded-xl"
            />
            <div className="absolute inset-2 bg-black/40 rounded-xl pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <section className="bg-rose-50 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-black">พบกับทีมช่างมืออาชีพของเรา</h2>
            <p className="text-black max-w-2xl mx-auto mt-4">
              ทีมงานของเราคือหัวใจของ ChaiLai Nails & Spa ทุกคนมีความเชี่ยวชาญและพร้อมที่จะรังสรรค์ผลงานที่ดีที่สุดเพื่อคุณ
            </p>
          </div>
          <div className="max-w-4xl mx-auto space-y-12">
            {employees.map((employee) => (
              <div key={employee.uid} className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full">
                {/* Top section with profile picture and name */}
                <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-6 mb-6">
                  <img
                    src={employee.profilePicture}
                    alt={employee.name}
                    className="w-32 h-32 sm:w-36 sm:h-36 rounded-full object-cover ring-4 ring-pink-200 flex-shrink-0"
                  />
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-black">{employee.name}</h3>
                    <p className="text-pink-600 font-semibold text-md sm:text-lg">{employee.position}</p>
                  </div>
                </div>
                {/* Divider */}
                <div className="border-t border-gray-200 my-6"></div>
                {/* Awards gallery */}
                <div>
                  <h4 className="text-md font-semibold text-center text-black mb-4">ใบประกาศนียบัตรและรางวัล</h4>
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <img src={`https://scontent.fbkk4-2.fna.fbcdn.net/v/t39.30808-6/560930181_32038427192422507_3827488895771154501_n.jpg?stp=dst-jpg_s720x720_tt6&_nc_cat=101&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeHAOvmnS9lJLo5IHNDgw0X1N6FBsRgB62Y3oUGxGAHrZi3kYmIPhl-Lmdd5rGkf3tObRvxMdgyITRabauZI9PLQ&_nc_ohc=qLYc8wENd1YQ7kNvwF-cneC&_nc_oc=AdmI4fpvOdZqGY8YmZ-4jyLwH5GYBAgzBEh-QoVcCPxi4rdHiMwIT-3zseo05S5_9Dw&_nc_zt=23&_nc_ht=scontent.fbkk4-2.fna&_nc_gid=XVJnp5u4FU_p515Hboi8Ow&oh=00_AfdC3gK6e2Skj_oIv0sW-NkG7DZGlmo-c2YmR3FhEgpUOA&oe=68F58EE6`} alt="Certificate" className="rounded-lg shadow-md w-full h-40 sm:h-56 object-contain bg-gray-100 p-1" />
                    <img src={`https://scontent.fbkk4-3.fna.fbcdn.net/v/t39.30808-6/509601933_122171412098371595_6472471195894067524_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=f727a1&_nc_eui2=AeHGm16e00Ivbz0u0AWs11Cyakk4cYCUXURqSThxgJRdRN0if8MMzF-GZAmE5c0LMqy99Qd3P082muP7VEKRHrOc&_nc_ohc=sD_8RvKsCFoQ7kNvwGBcq9i&_nc_oc=AdmQobZUmxhEholrjgAKC2WK8gzdqZjF9Lk0jRXlBsZWjKMICTPbhUGPSap_eBXGE9w&_nc_zt=23&_nc_ht=scontent.fbkk4-3.fna&_nc_gid=VAFtHEsgpz1Ka5Ep49ZLOw&oh=00_AffCByCwirXND1qPpPinpTfzS0cc4UrHX1Ozu32VMOoALw&oe=68F58ED0`} alt="Trophy" className="rounded-lg shadow-lg w-full h-48 sm:h-64 object-cover transform scale-105" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Events Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-black">กิจกรรมและการออกงาน</h2>
            <p className="text-black max-w-2xl mx-auto mt-4">
              เราไม่เคยหยุดนิ่งที่จะพัฒนาและนำเสนอสิ่งใหม่ๆ นี่คือส่วนหนึ่งของกิจกรรมที่เราได้เข้าร่วม
            </p>
          </div>
          <div className="space-y-20">
            {events.map((event, index) => (
              <div key={index} className="grid md:grid-cols-2 gap-12 items-center">
                {/* Image Gallery */}
                <div className={`flex flex-col gap-4 ${index % 2 !== 0 ? 'md:order-last' : ''}`}>
                  <div className="w-full">
                    <img src={event.images[0]} alt={event.title} className="rounded-xl shadow-lg w-full h-[250px] object-cover" />
                  </div>
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <img src={event.images[1]} alt={event.title} className="rounded-xl shadow-lg w-full h-[150px] object-cover" />
                    </div>
                    <div className="w-1/2">
                      <img src={event.images[2]} alt={event.title} className="rounded-xl shadow-lg w-full h-[150px] object-cover" />
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="text-center md:text-left">
                  <p className="text-pink-600 font-semibold mb-2">{event.date}</p>
                  <h3 className="text-3xl font-bold text-black mb-4">{event.title}</h3>
                  <p className="text-black">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Gallery Section */}
      <section className="bg-rose-50 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-black">ภาพความสำเร็จจากนักเรียน</h2>
            <p className="text-black max-w-2xl mx-auto mt-4">
              นี่คือส่วนหนึ่งของผลงานและความสำเร็จของนักเรียนที่จบหลักสูตรจากเรา
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {studentImages.map((image, index) => (
              <div key={index} className="overflow-hidden rounded-lg shadow-lg group aspect-w-3 aspect-h-4">
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 text-center bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-black mb-4">พร้อมสำหรับประสบการณ์ทำเล็บสุดพิเศษแล้วหรือยัง?</h2>
          <p className="text-black max-w-xl mx-auto mb-8">
            ให้เราดูแลและเปลี่ยนปลายนิ้วของคุณให้เป็นผลงานศิลปะชิ้นเอก
          </p>
          <button
            onClick={() => setCurrentPage('availability')}
            className="bg-pink-500 text-white py-3 px-10 rounded-full text-lg font-semibold hover:bg-pink-600 transition-all transform hover:scale-105 shadow-lg"
          >
            จองคิวเลย
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;