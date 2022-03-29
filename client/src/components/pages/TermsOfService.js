import React, { useState, useEffect } from 'react';
import axios from "axios";
import NavBarOut from "../commons/NavBarOut";
import Cookies from 'js-cookie';
import { Link } from "react-router-dom";

function TermsOfService(props) {



    return (
        <div>
            <NavBarOut/>
            <div>
                <p className="p1">PLEASE READ THESE TERMS OF USE BEFORE USING THIS WEBSITE.</p>
                <p className="p2">&nbsp;</p>
                <p className="p3"><span className="s1"><strong>Acceptance of the Terms of Use</strong></span></p>
                <p className="p3">Welcome to the website of the Minglr<span
                    className="Apple-converted-space">&nbsp; </span>&ldquo;(Project&rdquo;) at the Massachusetts
                    Institute of Technology (the &ldquo;Site&rdquo;).<span
                        className="Apple-converted-space">&nbsp; </span>These Terms of Use govern your use of this Site.
                    Please read these Terms of Use carefully before you start to use the Site. By using the Site, you
                    hereby accept these Terms of Use. If you do not agree to these Terms of Use, you should not visit
                    the Site.</p>
                <p className="p3"><span className="s1"><strong>Changes to the Terms of Use</strong></span></p>
                <p className="p3">MIT reserves the right to change these Terms of Use at any time in its sole discretion
                    by posting revisions on the Site. Such revisions will be effective immediately upon posting them to
                    the Site. Your use of the Site after such changes have been posted shall constitute your acceptance
                    of the revised Terms of Use.</p>
                <p className="p3"><span className="s1"><strong>Accessing this Site </strong></span></p>
                <ol className="ol1">
                    <li className="li3">By using this Site, you represent and warrant that you are 13 years or older. If
                        you are under the age of 13 years, you agree not to visit the Site.
                    </li>
                    <li className="li3">MIT reserves the right to change or update the Site, and any information,
                        service, tool, model, material, features and functionality (including but not limited to all
                        software, text, displays, downloadable spreadsheets, images, video and audio, and the design,
                        selection and arrangement thereof) or other content we provide on the Site
                        (collectively, &ldquo;Content&rdquo;), in our sole discretion and without notice. However, MIT
                        is under no obligation to update or correct any Content.
                    </li>
                    <li className="li3">MIT will not be responsible or liable if for any reason all or any part of the
                        Site is unavailable at any time or for any period. MIT may suspend access to the entire Site, or
                        some parts of the Site, or close it indefinitely, in MIT&rsquo;s discretion.
                    </li>
                    <li className="li3">You are responsible for making all arrangements necessary for you to have access
                        to the Site.
                    </li>
                    <li className="li3">You are responsible for ensuring that all persons who access the Site through
                        your Internet connection are aware of these Terms of Use, and that they comply with them.
                    </li>
                </ol>
                <p className="p3"><span className="s1"><strong>Prohibited Uses</strong></span></p>
                <ol className="ol1">
                    <li className="li3">You may use the Site only for lawful purposes and in accordance with these Terms
                        of Use. You agree not to use the Site or the Content:
                    </li>
                    <ol className="ol2">
                        <li className="li3">For commercial purposes, including that you may not reproduce, sell or
                            exploit for any commercial purposes any part of the Site, access to the Site, use of the
                            Site or any Content available through the Site;
                        </li>
                        <li className="li3">In any way that violates any applicable federal, state, local and
                            international law or regulation; and
                        </li>
                        <li className="li3">To engage in any other conduct that restricts or inhibits anyone&rsquo;s use
                            or enjoyment of the Site, or which, as determined by MIT, may harm MIT or users of the Site
                            or expose them to liability (for example, in a manner that that could disable, overburden,
                            damage, or impair the Site).
                        </li>
                    </ol>
                    <li className="li3">Additionally, you agree not to:</li>
                    <ol className="ol2">
                        <li className="li3">Use any robot, spider or other automatic device, process or means to access
                            the Site for any purpose, including to monitor or impermissibly copy any of the material on
                            the Site;
                        </li>
                        <li className="li3">Use any manual process to monitor or impermissibly copy any of the material
                            on the Site or for any other unauthorized purpose without the prior written consent of MIT;
                        </li>
                        <li className="li3">Introduce any viruses, Trojan horses, worms, logic bombs or other material
                            which is malicious or technologically harmful;
                        </li>
                        <li className="li3">Attempt to gain unauthorized access to, interfere with, damage or disrupt
                            any part of the Site, the server on which any part of the Site is stored or any server,
                            computer or database connected to the Site;
                        </li>
                        <li className="li3">Attack the Site via a denial-of-service attack or a distributed
                            denial-of-service attack; or
                        </li>
                        <li className="li3">Access or search or attempt to access or search the Site by any means
                            (automated or otherwise) other than through our currently available, published interfaces
                            provided by MIT; or
                        </li>
                        <li className="li3">Otherwise attempt to interfere with the proper working of the Site.</li>
                    </ol>
                </ol>
                <p className="p3"><span className="s1"><strong>Intellectual Property Rights</strong></span></p>
                <ol className="ol1">
                    <li className="li3">The Site and all intellectual property rights therein are owned by MIT, its
                        licensors or other providers. You must not use the name &ldquo;Massachusetts Institute of
                        Technology&rdquo; or any variation, adaptation, or abbreviation thereof, or of any of
                        MIT&rsquo;s trustees, officers, faculty, students, employees, or agents, or any trademark owned
                        by MIT (which includes the MIT logos) without the prior written permission of MIT. All other
                        trademarks appearing on the Site are the property of their respective owners.
                    </li>
                    <li className="li3">If and to the extent you provide any feedback, suggestions, recommendations,
                        analysis or other information or data to MIT in connection with your use of the Site
                        (&ldquo;Feedback&rdquo;), you hereby permit MIT to use, reproduce, disclose, distribute, modify,
                        and prepare derivative works of such Feedback for any purpose whatsoever in perpetuity.
                    </li>
                    <li className="li3">You must not:</li>
                    <ol className="ol2">
                        <li className="li3">Use any illustrations, photographs, video or audio sequences or any graphics
                            separately from the accompanying text; or
                        </li>
                        <li className="li3">Delete or alter any copyright, trademark or other proprietary rights notices
                            from any Content.
                        </li>
                    </ol>
                    <li className="li3">No right, title or interest in or to the Site or any Content is transferred to
                        you, and all rights not expressly granted are reserved by MIT. Any use of the Site not expressly
                        permitted by these Terms of Use is a breach of these Terms of Use and may violate copyright,
                        trademark and other laws.
                    </li>
                </ol>
                <p className="p3"><span className="s1"><strong>Disclaimer of Warranties</strong></span></p>
                <ol className="ol1">
                    <li className="li3">The Site and the Content is made available solely for general informational
                        purposes. THE SITE, THE CONTENT AND ANY INFORMATION OBTAINED THROUGH USE OF THE SITE AND THE
                        CONTENT ARE PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS, WITHOUT ANY
                        WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, STATUTORY OR OTHERWISE, INCLUDING BUT NOT
                        LIMITED TO ANY WARRANTIES OF MERCHANTABILITY, NON-INFRINGEMENT AND FITNESS FOR A PARTICULAR
                        PURPOSE. WITHOUT LIMITING THE FOREGOING, MIT MAKES NO WARRANTY THAT: (a) THE SITE OR THE CONTENT
                        IS ACCURATE, COMPLETE, USEFUL FOR A PARTICULAR PURPOSE OR UP-TO-DATE OR (b) THAT THE INFORMATION
                        THAT MAY BE OBTAINED FROM THE USE OF THE SITE OR CONTENT WILL BE ACCURATE, RELIABLE OR
                        OTHEREWISE MEET YOUR NEEDS OR EXPECTATIONS. YOUR USE OF, AND RELIANCE ON, THE SITE, THE CONTENT,
                        AND/OR ANY INFORMATION BASED UPON USE OF THE CONTENT IS STRICTLY AT YOUR OWN RISK. MIT shall not
                        be responsible or liable for your use of the Site, the Content, and/or any information based
                        upon your use of the Content.
                    </li>
                    <li className="li3">MIT does not guarantee or warrant that files available for downloading from the
                        Internet or the Site will be free of viruses or other destructive code. NEITHER MIT NOR ANY
                        PERSON ASSOCIATED WITH MIT MAKES ANY WARRANTY OR REPRESENTATION WITH RESPECT TO THE SECURITY,
                        RELIABILITY, QUALITY, OR AVAILABILITY OF THE SITE AND THE CONTENT. MIT WILL NOT BE LIABLE FOR
                        ANY LOSS OR DAMAGE CAUSED BY A DISTRIBUTED DENIAL-OF-SERVICE ATTACK, VIRUSES OR OTHER
                        TECHNOLOGICALLY HARMFUL MATERIAL THAT MAY INFECT YOUR COMPUTER EQUIPMENT, COMPUTER PROGRAMS,
                        DATA OR OTHER PROPRIETARY MATERIAL DUE TO YOUR USE OF THE SITE, THE CONTENT, YOUR DOWNLOADING OF
                        ANY AVAILABLE CONTENT, OR YOUR USE OF ANY WEBSITE LINKED TO THE SITE.
                    </li>
                    <li className="li3">THE FOREGOING DOES NOT AFFECT ANY WARRANTIES WHICH CANNOT BE EXCLUDED OR LIMITED
                        UNDER APPLICABLE LAW.
                    </li>
                </ol>
                <p className="p3"><span className="s1"><strong>Limitation on Liability</strong></span></p>
                <ol className="ol1">
                    <li className="li3">IN NO EVENT WILL MIT, ITS TRUSTEES, DIRECTORS, OFFICERS, FACULTY, STUDENTS,
                        EMPLOYEES, AGENTS, AFFILIATES AND THEIR RESPECTIVE SUCCESSORS, HEIRS AND ASSIGNS BE LIABLE FOR
                        DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN CONNECTION WITH YOUR USE, OR
                        INABILITY TO USE, THE SITE, THE CONTENT, ANY WEBSITES LINKED TO THE SITE OR CONTENT OR ANY
                        INFORMATION OBTAINED THROUGH THE SITE, CONTENT OR SUCH THIRD PARTY WEBSITES, INCLUDING ANY
                        DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, WHICH MAY INCLUDE<span
                            className="Apple-converted-space">&nbsp; </span>BUT NOT BE LIMITED TO, PERSONAL INJURY, LOST
                        PROFITS, LOSS OF BUSINESS OR ANTICIPATED SAVINGS, LOSS OF GOODWILL, LOSS OF DATA, AND WHETHER
                        CAUSED BY TORT (INCLUDING NEGLIGENCE), BREACH OF CONTRACT OR OTHERWISE, EVEN IF FORSEEABLE.
                    </li>
                    <li className="li3">THE FOREGOING DOES NOT AFFECT ANY LIABILITY WHICH CANNOT BE EXCLUDED OR LIMITED
                        UNDER APPLICABLE LAW.
                    </li>
                </ol>
                <p className="p3"><span className="s1"><strong>Indemnification</strong></span></p>
                <p className="p3">To the fullest extent permitted by law, you shall indemnify MIT and all of its
                    trustees, directors, officers, faculty, students, employees, agents, affiliates and their respective
                    successors, heirs and assigns (collectively, the &ldquo;Indemnified Parties&rdquo;) from and against
                    any and all losses and liabilities, including, without limitation, reasonable attorneys&rsquo; fees
                    incurred by the Indemnified Parties in connection with any claim arising from or related to your
                    breach of these Terms of Use, your use of the Site and the Content and your use of any information
                    obtained through use of the Site and Content. You shall cooperate as fully as reasonably required in
                    the defense of any such claim.</p>
                <p className="p3"><span className="s1"><strong>Monitoring and Enforcement</strong></span></p>
                <p className="p3">MIT has the right to: (a) take appropriate legal action, including without limitation,
                    referral to law enforcement, for any illegal or unauthorized use of the Site and (b) terminate your
                    access to all or part of the Site for any or no reason, including without limitation any violation
                    of these Terms of Use.</p>
                <p className="p3"><span className="s1"><strong>Site Assistance</strong></span></p>
                <p className="p3">You understand that MIT does not provide customer assistance or technical support for
                    use of the Site. You may contact us concerning technical problems but MIT is under no obligation to
                    fix or correct any technical issue.</p>
                <p className="p3"><span className="s1"><strong>Links from the Site </strong></span></p>
                <p className="p3">If the Site contains links to other websites and resources provided by or hosted by
                    third parties, these links are provided for your convenience only. MIT has no control over the
                    contents of those websites or resources and accepts no responsibility for them or for any loss or
                    damage that may arise from your use of them. If you decide to access any of the third party websites
                    linked to the Site, you do so entirely at your own risk and subject to the terms and conditions of
                    use for such websites.</p>
                <p className="p3"><span className="s1"><strong>Geographic Restrictions</strong></span></p>
                <p className="p3">The Site is operated by MIT from Cambridge, Massachusetts in the United States of
                    America. Content is not intended for distribution to, or use by, any person or entity in any
                    jurisdiction or country where such distribution or use would be contrary to law or regulation or
                    which would subject MIT to any registration or other requirement within such jurisdiction or
                    country. MIT reserves the right to limit access or availability of the Site to any person,
                    geographic region or jurisdiction.</p>
                <p className="p3"><span className="s1"><strong>Dispute Resolution By Arbitration</strong></span></p>
                <p className="p3">The parties shall settle any dispute arising out of or relating to these Terms of Use
                    or your use of the Site by arbitration in the city of Boston, Massachusetts, USA, in accordance with
                    the applicable rules of the American Arbitration Association then in effect. The arbitrator&rsquo;s
                    award shall be final and may be confirmed by the judgment of a state or federal court in the city of
                    Boston, Massachusetts.</p>
                <p className="p3"><span className="s1"><strong>Governing Law</strong></span></p>
                <p className="p3">These Terms of Use and all disputes or controversies arising out of or relating to
                    these Terms of Use and your use of the Site and the Content shall be governed by, and construed in
                    accordance with, the laws of the Commonwealth of Massachusetts without regard to conflicts of law
                    provisions that would require the laws of another jurisdiction to apply.</p>
                <p className="p3"><span className="s1"><strong>Limitation on Time to File Claims</strong></span></p>
                <p className="p3">ANY CAUSE OF ACTION OR CLAIM YOU MAY HAVE ARISING OUT OF OR RELATING TO THESE TERMS OF
                    USE OR THE SITE OR THE CONTENT MUST BE COMMENCED WITHIN ONE (1) YEAR AFTER THE CAUSE OF ACTION
                    ACCRUES, OTHERWISE SUCH CAUSE OF ACTION OR CLAIM IS PERMANENTLY BARRED.</p>
                <p className="p3"><span className="s1"><strong>Waiver and Severability</strong></span></p>
                <p className="p3">No waiver of these Terms of Use by MIT shall be deemed a further or continuing waiver
                    of such term or condition or any other term or condition, and any failure of MIT to assert a right
                    or provision under these Terms of Use shall not constitute a waiver of such right or provision.<span
                        className="Apple-converted-space">&nbsp; </span>If any provision of these Terms of Use is held
                    by a court of competent jurisdiction to be invalid, illegal or unenforceable for any reason, such
                    provision shall be eliminated or limited to the minimum extent such that the remaining provisions of
                    the Terms of Use will continue in full force and effect.</p>
                <p className="p3"><span className="s1"><strong>Comments and Concerns.</strong></span></p>
                <ol className="ol1">
                    <li className="li3">The Site is operated by the MIT Center for Collective Intelligence at MIT.<span
                        className="Apple-converted-space">&nbsp; </span>All technical issues or questions may be
                        directed to minglr.cs at gmail.com, provided that MIT is under no obligation to respond to your
                        email or make any requested fix.
                    </li>
                    <li className="li3">All other feedback and comments concerning the Site and the Content, or other
                        general inquiries related to Minglr should be directed to minglr.cs at gmail.com<span
                            className="s3">.</span></li>
                </ol>
                <p className="p4">&nbsp;</p>
                <p className="p3">Thank you for visiting our Site.</p>
            </div>
        </div>
    )
}

export default TermsOfService
